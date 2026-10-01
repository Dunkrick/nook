import { getRabbitChannel } from "./rabbitmq.js";
import { GITHUB_QUEUE } from "./github-events.js";
import prisma from "../prisma.js";

async function startWorker() {
  const channel = await getRabbitChannel();

  console.log("GitHub worker started. Waiting for messages...");

  await channel.consume(GITHUB_QUEUE, async (message) => {
    if (!message) {
      return;
    }

    const event = JSON.parse(message.content.toString());

    console.log("GitHub event received by worker:", {
      event: event.event,
      deliveryId: event.deliveryId,
    });

    const existing = await prisma.webhookDelivery.findUnique({
      where: {
        deliveryId: event.deliveryId,
      },
    });

    if (existing) {
      console.log(
        "Duplicate webhook, skipping:",
        event.deliveryId,
      );

      channel.ack(message);
      return;
    }

    await prisma.webhookDelivery.create({
      data: {
        deliveryId: event.deliveryId,
        event: event.event,
        status: "PROCESSED",
        processedAt: new Date(),
      },
    });

    channel.ack(message);
  });
}

startWorker().catch((error) => {
  console.error("Worker failed to start:", error);
  process.exit(1);
});