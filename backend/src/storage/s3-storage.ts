import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { ObjectStorage, StoredObject } from "./object-storage.js";
import { env } from "../config/env.js";

export interface S3StorageOptions {
    bucketName?: string;
    region?: string;
    client?: S3Client;
}

export class S3Storage implements ObjectStorage {
    private readonly client: S3Client;
    private readonly bucketName: string;

    constructor(options?: S3StorageOptions) {
        this.bucketName = options?.bucketName ?? env.S3_BUCKET_NAME;

        if (options?.client) {
            this.client = options.client;
        } else {
            const hasExplicitCredentials =
                Boolean(env.AWS_ACCESS_KEY_ID) &&
                Boolean(env.AWS_SECRET_ACCESS_KEY);

            this.client = new S3Client({
                region: options?.region ?? env.AWS_REGION ?? "ap-south-1",
                ...(hasExplicitCredentials
                    ? {
                          credentials: {
                              accessKeyId: env.AWS_ACCESS_KEY_ID,
                              secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
                          },
                      }
                    : {}),
            });
        }
    }

    async upload(
        buffer: Buffer,
        metadata: {
            key: string;
            contentType: string;
        },
    ): Promise<StoredObject> {
        await this.client.send(
            new PutObjectCommand({
                Bucket: this.bucketName,
                Key: metadata.key,
                Body: buffer,
                ContentType: metadata.contentType,
            }),
        );

        return {
            key: metadata.key,
            url: `s3://${this.bucketName}/${metadata.key}`,
            contentType: metadata.contentType,
            size: buffer.length,
        };
    }

    async getSignedReadUrl(
        key: string,
        expiresInSeconds: number,
    ): Promise<string> {
        const command = new GetObjectCommand({
            Bucket: this.bucketName,
            Key: key,
        });

        return getSignedUrl(this.client, command, {
            expiresIn: expiresInSeconds,
        });
    }
}
