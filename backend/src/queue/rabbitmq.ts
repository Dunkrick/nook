import amqp, { type Channel, type ChannelModel } from "amqplib";

const RABBITMQ_URL = "amqp://localhost:5672";

export const GITHUB_QUEUE = "github-events";
export const GITHUB_DLQ = "github-events-dlq";

let connection: ChannelModel | null = null;
let channel: Channel | null = null;

export async function getRabbitChannel(): Promise<Channel> {
  if (channel) {
    return channel;
  }

  connection = await amqp.connect(RABBITMQ_URL);
  channel = await connection.createChannel();

  await channel.assertQueue(GITHUB_DLQ, {
    durable: true,
  });

  return channel;
}