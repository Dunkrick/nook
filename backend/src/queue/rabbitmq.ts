import amqp, {
  type ChannelModel,
  type ConfirmChannel,
} from "amqplib";
import { env } from "../config/env.js";

export const GITHUB_QUEUE = "github-events";
export const GITHUB_DLQ = "github-events-dlq";

let connection: ChannelModel | null = null;
let channel: ConfirmChannel | null = null;

export async function getRabbitChannel(): Promise<ConfirmChannel> {
  if (channel) {
    return channel;
  }

  connection = await amqp.connect(env.RABBITMQ_URL);
  channel = await connection.createConfirmChannel();

  await channel.assertQueue(GITHUB_DLQ, {
    durable: true,
  });

  return channel;
}