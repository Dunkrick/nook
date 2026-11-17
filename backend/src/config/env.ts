import "dotenv/config";

const requiredEnv = (name: string): string => {
  const value = process.env[name];

  if (!value) {
    if (process.env.NODE_ENV === "test") {
      return `test-${name.toLowerCase().replace(/_/g, "-")}`;
    }
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

export const env = {
  PORT: Number(process.env.PORT ?? 3003),
  DATABASE_URL: requiredEnv("DATABASE_URL"),
  JWT_SECRET: requiredEnv("JWT_SECRET"),
  FRONTEND_URL: requiredEnv("FRONTEND_URL"),
  S3_BUCKET_NAME: process.env.S3_BUCKET_NAME ?? process.env.GCS_BUCKET_NAME ?? (process.env.NODE_ENV === "test" ? "test-s3-bucket" : ""),
  GCS_BUCKET_NAME: process.env.GCS_BUCKET_NAME ?? process.env.S3_BUCKET_NAME ?? (process.env.NODE_ENV === "test" ? "test-gcs-bucket" : ""),
  AWS_REGION: process.env.AWS_REGION ?? "ap-south-1",
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID ?? "",
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY ?? "",
  GITHUB_WEBHOOK_SECRET: requiredEnv("GITHUB_WEBHOOK_SECRET"),
  RABBITMQ_URL: requiredEnv("RABBITMQ_URL"),
  BACKEND_URL: process.env.BACKEND_URL ?? `http://localhost:${Number(process.env.PORT ?? 3003)}`,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ?? "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ?? "",
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID ?? "",
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET ?? "",
};