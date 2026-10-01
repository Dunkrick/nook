import { getRabbitChannel } from "./rabbitmq.js";
import {
  GITHUB_DLQ,
  GITHUB_QUEUE,
  GITHUB_RETRY_QUEUE_1,
  GITHUB_RETRY_QUEUE_2,
  GITHUB_RETRY_QUEUE_3,
} from "./github-events.js";
import prisma from "../prisma.js";

async function startWorker() {
  const channel = await getRabbitChannel();

  console.log("GitHub worker started. Waiting for messages...");

  await channel.consume(GITHUB_QUEUE, async (message) => {
  if (!message) {
    return;
  }

  const event: {
    event: string;
    deliveryId: string;
    retryCount?: number;
  } = JSON.parse(message.content.toString());

  try {
    const retryCount = event.retryCount ?? 0;

    console.log("GitHub event received by worker:", {
      event: event.event,
      deliveryId: event.deliveryId,
      retryCount,
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
  } catch (error) {
    console.error("GitHub event processing failed:", error);

    const retryCount = event.retryCount ?? 0;
    const nextRetryCount = retryCount + 1;

    try {
      if (nextRetryCount > 3) {
        channel.sendToQueue(
          GITHUB_DLQ,
          message.content,
          {
            persistent: true,
          },
        );

        console.log(
          "GitHub event moved to DLQ:",
          event.deliveryId,
        );
      } else {
        const retryEvent = {
          ...event,
          retryCount: nextRetryCount,
        };

        const retryQueue =
          nextRetryCount === 1
            ? GITHUB_RETRY_QUEUE_1
            : nextRetryCount === 2
              ? GITHUB_RETRY_QUEUE_2
              : GITHUB_RETRY_QUEUE_3;

        channel.sendToQueue(
          retryQueue,
          Buffer.from(JSON.stringify(retryEvent)),
          {
            persistent: true,
          },
        );

        console.log(
          `GitHub event scheduled for retry ${nextRetryCount}:`,
          event.deliveryId,
        );
      }

      channel.ack(message);
    } catch (publishError) {
      console.error(
        "Failed to publish GitHub event for retry/DLQ:",
        publishError,
      );

      // Do not ACK.
      // RabbitMQ can redeliver the original message.
    }
  }
});
}

startWorker().catch((error) => {
  console.error("Worker failed to start:", error);
  process.exit(1);
});