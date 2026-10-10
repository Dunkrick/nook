import amqp, {
  type ChannelModel,
  type ConfirmChannel,
} from "amqplib";
import { env } from "../config/env.js";
import { setupGithubQueue } from "./github-events.js";

export const GITHUB_QUEUE = "github-events";
export const GITHUB_DLQ = "github-events-dlq";

const INITIAL_RECONNECT_DELAY_MS = 1000;
const MAX_RECONNECT_DELAY_MS = 30000;

let connection: ChannelModel | null = null;
let channel: ConfirmChannel | null = null;
let connecting: Promise<ConfirmChannel> | null = null;

function invalidateConnection() {
  channel = null;
  connection = null;
}

export async function connectRabbit(): Promise<ConfirmChannel> {
  if(channel) return channel;
  if(connecting) return connecting;

  connecting = (async () => {
    const nextConnection = await amqp.connect(env.RABBITMQ_URL);
    const nextChannel = await nextConnection.createConfirmChannel();

    await setupGithubQueue(nextChannel);

    nextConnection.on("error", (error) => {
      console.error("RabbitMQ connection error:", error);
    });

    nextConnection.on("close", () => {
      console.warn("RabbitMQ connection closed");

      if (connection === nextConnection) {
        invalidateConnection();
      }
    });

    nextChannel.on("error", (error) => {
      console.error("RabbitMQ channel error:", error);
    });

    nextChannel.on("close", () => {
      console.warn("RabbitMQ channel closed");

      if (channel === nextChannel) {
        channel = null;
      }
    });

    connection = nextConnection;
    channel = nextChannel;

    return nextChannel;
  })();

  try{
    return await connecting;
  }finally{
    connecting = null;
  }

}

export async function getRabbitChannel() {
  return connectRabbit();
}