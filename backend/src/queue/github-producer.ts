import { getRabbitChannel } from "./rabbitmq.js";
import { GITHUB_QUEUE } from "./github-events.js";

export async function publishGithubEvent(event: unknown) {
  const channel = await getRabbitChannel();

  channel.sendToQueue(
    GITHUB_QUEUE,
    Buffer.from(JSON.stringify(event)),
    {
      persistent: true,
    },
  );
}