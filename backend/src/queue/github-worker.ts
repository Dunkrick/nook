import { getRabbitChannel } from "./rabbitmq.js";
import { GITHUB_QUEUE } from "./github-events.js";

async function startWorker() {
  const channel = await getRabbitChannel();

  console.log("GitHub worker started. Waiting for messages...");

  await channel.consume(GITHUB_QUEUE, (message) => {
    if (!message) {
      return;
    }

    const event = JSON.parse(message.content.toString());

    console.log("GitHub event received by worker:", {
      event: event.event,
      deliveryId: event.deliveryId,
    });

    channel.ack(message);
  });
}

startWorker().catch((error) => {
  console.error("Worker failed to start:", error);
  process.exit(1);
});