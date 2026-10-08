import { vi, describe, it, expect, beforeEach } from "vitest";
import { handleGithubMessage } from "../github-worker.js";
import prisma from "../../prisma.js";

// Mock prisma so we don't try to connect to a real database
vi.mock("../../prisma.js", () => ({
  default: {
    $transaction: vi.fn(),
  },
}));

describe("GitHub Worker", () => {
  let mockChannel: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockChannel = {
      ack: vi.fn(),
      sendToQueue: vi.fn(),
      waitForConfirms: vi.fn().mockResolvedValue(undefined),
    };
  });

  it("Test 3: confirmation failure when sending to retry/DLQ queue does NOT ack the message", async () => {
    // A dummy message representing a GitHub event
    const dummyMessage = {
      content: Buffer.from(
        JSON.stringify({
          event: "ping",
          deliveryId: "123",
          payload: {
            action: "created",
            issue: { number: 1, title: "test", state: "open", html_url: "url", body: "body" },
            repository: { owner: { login: "test" }, name: "test" }
          },
        })
      ),
    };

    // 1. Force prisma transaction to fail to trigger the worker's catch block (simulating DB error during event processing)
    vi.mocked(prisma.$transaction).mockRejectedValue(new Error("Database went down"));

    // 2. Force the RabbitMQ confirmation for the retry/DLQ publish to fail
    mockChannel.waitForConfirms.mockRejectedValue(new Error("RabbitMQ down during retry publish"));

    // Run the handler
    await handleGithubMessage(dummyMessage, mockChannel);

    // 3. Assertions
    // Ensure we attempted to publish to a retry queue (because DB failed)
    expect(mockChannel.sendToQueue).toHaveBeenCalled();
    // Verify that because the retry publish failed, we DID NOT ack the original message.
    // This proves the worker doesn't silently lose events!
    expect(mockChannel.ack).not.toHaveBeenCalled();
  });
});
