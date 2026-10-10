import { getRabbitChannel } from "./rabbitmq.js";
import {
  GITHUB_DLQ,
  GITHUB_QUEUE,
  GITHUB_RETRY_QUEUE_1,
  GITHUB_RETRY_QUEUE_2,
  GITHUB_RETRY_QUEUE_3,
} from "./github-events.js";
import { PermanentGithubEventError } from "./github-errors.js";
import prisma from "../prisma.js";
import { syncGithubIssue } from "../services/github-sync.js";
import { setTimeout as sleep } from "node:timers/promises";

const GITHUB_WORKER_PREFETCH = 5;

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


export async function handleGithubMessage(
  message: any, // using any here temporarily to avoid adding amqplib imports for now
  channel: any
) {
  if (!message) {
    return;
  }

  let event: GithubEvent;

  //parsing guard
  try {
    event = JSON.parse(message.content.toString());
  } catch (error) {
    console.error("Malformed GitHub queue message:", error);

    try {
    channel.sendToQueue(GITHUB_DLQ, message.content, {
      persistent: true,
    });

    await channel.waitForConfirms();
    channel.ack(message);
  } catch (publishError) {
    console.error("Failed to publish malformed message to DLQ:", publishError);
    // Do not ACK the original message.
  }

  return;
  }

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

    // Permanent errors (e.g. unmapped repo, invalid payload) go straight to DLQ.
    // Transient errors (e.g. DB outage) go through the bounded retry path.
    const isPermanent = error instanceof PermanentGithubEventError;
    const retryCount = event.retryCount ?? 0;
    const nextRetryCount = retryCount + 1;

    try {
      if (isPermanent || nextRetryCount > 3) {
        channel.sendToQueue(
          GITHUB_DLQ,
          message.content,
          { persistent: true },
        );
        await channel.waitForConfirms();

        console.log(
          isPermanent
            ? `GitHub event permanently failed, moved to DLQ: ${event.deliveryId}`
            : `GitHub event moved to DLQ after ${retryCount} retries: ${event.deliveryId}`,
        );
      } else {
        const retryEvent = { ...event, retryCount: nextRetryCount };

        const retryQueue =
          nextRetryCount === 1
            ? GITHUB_RETRY_QUEUE_1
            : nextRetryCount === 2
              ? GITHUB_RETRY_QUEUE_2
              : GITHUB_RETRY_QUEUE_3;

        channel.sendToQueue(
          retryQueue,
          Buffer.from(JSON.stringify(retryEvent)),
          { persistent: true },
        );
        await channel.waitForConfirms();
        console.log(
          `GitHub event scheduled for retry ${nextRetryCount}: ${event.deliveryId}`,
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
}

export async function consumeGithubEvents() {
  const channel = await getRabbitChannel();
  console.log("GitHub worker started. Waiting for messages...");

  await channel.prefetch(GITHUB_WORKER_PREFETCH);

  await channel.consume(GITHUB_QUEUE, (msg) => handleGithubMessage(msg, channel));

  // Return a promise that only resolves when the channel dies
  return new Promise<void>((resolve) => {
    channel.on("close", () => {
      console.log("RabbitMQ channel closed in consumer!");
      resolve();
    });
    channel.on("error", (error) => {
      console.error("RabbitMQ channel error in consumer:", error);
      resolve();
    });
  });
}

export async function startWorker() {
  let delay = 1000;

  while (true) {
    try {
      // This will block until the connection/channel drops
      await consumeGithubEvents();

      // If we are here, we successfully connected but eventually disconnected.
      // Reset the backoff delay.
      delay = 1000;
    } catch (error) {
      console.error("GitHub worker connection failed:", error);
    }

    console.log(`Waiting ${delay}ms before reconnecting...`);
    await sleep(delay);

    // Exponential backoff, max 30 seconds
    delay = Math.min(delay * 2, 30_000);
  }
}

if (process.env.NODE_ENV !== "test") {
  startWorker().catch((error) => {
    console.error("Worker failed to start:", error);
    process.exit(1);
  });
}