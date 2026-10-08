import { getRabbitChannel } from "./rabbitmq.js";

export const GITHUB_QUEUE = "github-events";
export const GITHUB_RETRY_QUEUE_1 = "github-events-retry-1";
export const GITHUB_RETRY_QUEUE_2 = "github-events-retry-2";
export const GITHUB_RETRY_QUEUE_3 = "github-events-retry-3";
export const GITHUB_DLQ = "github-events-dlq";

export async function setupGithubQueue() {
  const channel = await getRabbitChannel();

  await channel.assertQueue(GITHUB_DLQ, {
    durable: true,
  });

  await channel.assertQueue(GITHUB_RETRY_QUEUE_1, {
    durable: true,
    arguments: {
      "x-message-ttl": 5000,
      "x-dead-letter-exchange": "",
      "x-dead-letter-routing-key": GITHUB_QUEUE,
    },
  });

  await channel.assertQueue(GITHUB_RETRY_QUEUE_2, {
    durable: true,
    arguments: {
      "x-message-ttl": 10000,
      "x-dead-letter-exchange": "",
      "x-dead-letter-routing-key": GITHUB_QUEUE,
    },
  });

  await channel.assertQueue(GITHUB_RETRY_QUEUE_3, {
    durable: true,
    arguments: {
      "x-message-ttl": 20000,
      "x-dead-letter-exchange": "",
      "x-dead-letter-routing-key": GITHUB_QUEUE,
    },
  });

  await channel.assertQueue(GITHUB_QUEUE, {
    durable: true,
  });
}