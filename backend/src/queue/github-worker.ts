import { getRabbitChannel } from "./rabbitmq.js";
import {
  GITHUB_DLQ,
  GITHUB_QUEUE,
  GITHUB_RETRY_QUEUE_1,
  GITHUB_RETRY_QUEUE_2,
  GITHUB_RETRY_QUEUE_3,
} from "./github-events.js";
import prisma from "../prisma.js";
import { syncGithubIssue } from "../services/github-sync.js";

type GithubIssuePayload = {
  action: string;
  issue: {
    number: number;
    title: string;
    body: string | null;
    state: string;
    html_url: string;
  };
  repository: {
    owner: {
      login: string;
    };
    name: string;
  };
};

type GithubEvent = {
  event: string;
  deliveryId: string;
  payload: GithubIssuePayload;
  retryCount?: number;
};

async function startWorker() {
  const channel = await getRabbitChannel();

  console.log("GitHub worker started. Waiting for messages...");

  await channel.consume(GITHUB_QUEUE, async (message) => {
  if (!message) {
    return;
  }

  const event: GithubEvent = JSON.parse(
  message.content.toString(),
);

  try {
    const retryCount = event.retryCount ?? 0;

    console.log("GitHub event received by worker:", {
      event: event.event,
      deliveryId: event.deliveryId,
      retryCount,
    });

    const result = await prisma.$transaction(async (tx) => {
    const existing = await tx.webhookDelivery.findUnique({
      where: {
        deliveryId: event.deliveryId,
      },
    });

    if (existing) {
      return {
            duplicate: true,
            artifact: null,
          };
    }

      let artifact = null;

      if (event.event === "issues") {
        artifact = await syncGithubIssue(event.payload, tx);
      }

      await tx.webhookDelivery.create({
        data: {
            deliveryId: event.deliveryId,
            event: event.event,
          status: "PROCESSED",
          processedAt: new Date(),
        },
      });

        return {
          duplicate: false,
          artifact,
        };
    });

    if (result.duplicate) {
      console.log(
        "Duplicate webhook, skipping:",
        event.deliveryId,
      );
    } else if (result.artifact) {
    console.log(
      "GitHub issue synchronized to Nook:",
      result.artifact.id,
    );
  }

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