import { vi, describe, it, expect, beforeEach } from "vitest";
import { handleGithubMessage, consumeGithubEvents, startWorker } from "../github-worker.js";
import prisma from "../../prisma.js";
import { getRabbitChannel } from "../rabbitmq.js";
import { setTimeout as sleep } from "node:timers/promises";

// Mock prisma so we don't try to connect to a real database
vi.mock("../../prisma.js", () => ({
  default: {
    $transaction: vi.fn(),
  },
}));

vi.mock("../rabbitmq.js", () => ({
  getRabbitChannel: vi.fn(),
}));

vi.mock("node:timers/promises", () => ({
  setTimeout: vi.fn(),
}));

describe("GitHub Worker - Event Processing (Existing processing semantics remain unchanged)", () => {
  let mockChannel: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockChannel = {
      ack: vi.fn(),
      sendToQueue: vi.fn(),
      waitForConfirms: vi.fn().mockResolvedValue(undefined),
    };
  });

  it("Test C: confirmation failure when sending to retry queue does NOT ack the message", async () => {
    const dummyMessage = {
      content: Buffer.from(
        JSON.stringify({
          event: "ping",
          deliveryId: "123",
          payload: {
            action: "created",
            issue: { number: 1, title: "test", state: "open", html_url: "url", body: "body" },
            repository: { owner: { login: "test" }, name: "test" },
          },
        })
      ),
    };

    vi.mocked(prisma.$transaction).mockRejectedValue(new Error("Database went down"));
    mockChannel.waitForConfirms.mockRejectedValue(new Error("RabbitMQ down during retry publish"));

    await handleGithubMessage(dummyMessage, mockChannel);

    expect(mockChannel.sendToQueue).toHaveBeenCalled();
    expect(mockChannel.ack).not.toHaveBeenCalled();
  });
});

describe("GitHub Worker - Lifecycle (Prefetch & Reconnect)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Test A: prefetch is configured BEFORE consumption begins", async () => {
    const callOrder: string[] = [];
    const mockChannel = {
      prefetch: vi.fn().mockImplementation((count) => {
        callOrder.push(`prefetch-${count}`);
      }),
      consume: vi.fn().mockImplementation((queue) => {
        callOrder.push(`consume-${queue}`);
      }),
      on: vi.fn(), 
    };

    vi.mocked(getRabbitChannel).mockResolvedValue(mockChannel as any);

    // Call the lifecycle function
    const consumerPromise = consumeGithubEvents(); 

    // Yield to the event loop so the synchronous awaits can run
    await new Promise(process.nextTick);

    // Simulate the channel closing so the promise resolves cleanly and doesn't leak
    const closeCallback = mockChannel.on.mock.calls.find(call => call[0] === "close")?.[1];
    closeCallback();
    await consumerPromise;

    // Assert the exact execution order!
    expect(callOrder).toEqual([
      "prefetch-5",
      "consume-github-events",
    ]);
  });

  it("Test B: prefetch is reapplied after a reconnect", async () => {
    // 1. Create two separate mock channels
    const originalChannel = { prefetch: vi.fn(), consume: vi.fn(), on: vi.fn() };
    const replacementChannel = { prefetch: vi.fn(), consume: vi.fn(), on: vi.fn() };

    // 2. Return original first, replacement second
    vi.mocked(getRabbitChannel)
      .mockResolvedValueOnce(originalChannel as any)
      .mockResolvedValueOnce(replacementChannel as any);

    // 3. Let sleep resolve instantly on the first reconnect wait, then break the loop on the next wait
    vi.mocked(sleep)
      .mockResolvedValueOnce(undefined as any)
      .mockRejectedValueOnce(new Error("STOP_LOOP"));

    // 4. Start the worker in the background
    startWorker().catch(() => {});

    // Flush promises to let the first consumer finish setting up
    await new Promise(process.nextTick); 

    // 5. Assert first channel got prefetch
    expect(originalChannel.prefetch).toHaveBeenCalledWith(5);

    // 6. Simulate the disconnect on the FIRST channel
    const closeCallback = originalChannel.on.mock.calls.find(call => call[0] === "close")?.[1];
    expect(closeCallback).toBeDefined();
    closeCallback(); 

    // 7. Yield the event loop to let the while loop advance, hit the mocked sleep, and restart consumeGithubEvents
    await new Promise((resolve) => setTimeout(resolve, 10));

    // 8. Assert replacement channel ALSO got prefetch!
    expect(replacementChannel.prefetch).toHaveBeenCalledWith(5);
  });
});

describe("GitHub Worker - Parsing Guard", () => {
  let mockChannel: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockChannel = {
      ack: vi.fn(),
      sendToQueue: vi.fn(),
      waitForConfirms: vi.fn().mockResolvedValue(undefined),
    };
  });

  it("Malformed JSON goes directly to the DLQ and is ACKed only after DLQ confirmation", async () => {
    const malformedMessage = {
      content: Buffer.from("this is not valid json {"),
    };

    await handleGithubMessage(malformedMessage, mockChannel);

    expect(mockChannel.sendToQueue).toHaveBeenCalledWith(
      "github-events-dlq",
      malformedMessage.content,
      { persistent: true }
    );
    expect(mockChannel.waitForConfirms).toHaveBeenCalled();
    expect(mockChannel.ack).toHaveBeenCalledWith(malformedMessage);
  });

  it("DLQ publish failure leaves the original unacknowledged", async () => {
    const malformedMessage = {
      content: Buffer.from("this is not valid json {"),
    };

    mockChannel.waitForConfirms.mockRejectedValue(new Error("DLQ down"));

    await handleGithubMessage(malformedMessage, mockChannel);

    expect(mockChannel.sendToQueue).toHaveBeenCalled();
    expect(mockChannel.ack).not.toHaveBeenCalled();
  });
});