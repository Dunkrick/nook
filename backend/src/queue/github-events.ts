import { getRabbitChannel } from "./rabbitmq.js";

export const GITHUB_QUEUE = "github-events";

export async function setupGithubQueue() {
  const channel = await getRabbitChannel();

  await channel.assertQueue(GITHUB_QUEUE, {
    durable: true,
  });
}