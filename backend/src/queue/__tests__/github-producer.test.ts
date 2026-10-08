import { vi, describe, it, expect, beforeEach } from "vitest";
import { publishGithubEvent } from "../github-producer.js";
import { getRabbitChannel } from "../rabbitmq.js";

// Mock the rabbitmq module so we don't try to connect to a real RabbitMQ server during tests
vi.mock("../rabbitmq.js", () => ({
  getRabbitChannel: vi.fn(),
}));

describe("GitHub Producer", () => {
  let mockChannel: any;

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();

    // Create a mock channel with dummy functions for sendToQueue and waitForConfirms
    mockChannel = {
      sendToQueue: vi.fn(),
      waitForConfirms: vi.fn().mockResolvedValue(undefined), // Simulates a successful confirmation by default
    };

    // Make getRabbitChannel return our mockChannel
    vi.mocked(getRabbitChannel).mockResolvedValue(mockChannel);
  });

  it("Test 1: successful publish waits for confirmation", async () => {
    const dummyEvent = { event: "ping", deliveryId: "123" };
    
    // Call the function we want to test
    await publishGithubEvent(dummyEvent);

    // Assert that sendToQueue was called
    expect(mockChannel.sendToQueue).toHaveBeenCalled();
    // Assert that we waited for confirmation
    expect(mockChannel.waitForConfirms).toHaveBeenCalled();
  });

  it("Test 2: confirmation failure rejects and throws an error", async () => {
    const dummyEvent = { event: "ping", deliveryId: "123" };
    
    // Force waitForConfirms to simulate a failure
    mockChannel.waitForConfirms.mockRejectedValue(new Error("RabbitMQ confirmation failed"));

    // Assert that calling publishGithubEvent throws the error. 
    // This proves that if confirmation fails, the error bubbles up (e.g. to the express route).
    await expect(publishGithubEvent(dummyEvent)).rejects.toThrow("RabbitMQ confirmation failed");
    
    // sendToQueue should still have been called before it failed
    expect(mockChannel.sendToQueue).toHaveBeenCalled();
  });
});
