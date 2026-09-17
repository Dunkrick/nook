import { Storage } from "@google-cloud/storage";
import type {
    ObjectStorage,
    StoredObject,
} from "./object-storage.js";

const storage = new Storage();

export class GoogleCloudStorage implements ObjectStorage {
    constructor(private readonly bucketName: string) {}

    async upload(
        buffer: Buffer,
        metadata: {
            key: string;
            contentType: string;
        },
    ): Promise<StoredObject> {
        const bucket = storage.bucket(this.bucketName);
        const file = bucket.file(metadata.key);

        await file.save(buffer, {
            metadata: {
                contentType: metadata.contentType,
            },
        });

        return {
            key: metadata.key,
            url: `gs://${this.bucketName}/${metadata.key}`,
            contentType: metadata.contentType,
            size: buffer.length,
        };
    }

    async getSignedReadUrl(
        key: string,
        expiresInSeconds: number,
    ): Promise<string> {
        const bucket = storage.bucket(this.bucketName);
        const file = bucket.file(key);

        const [url] = await file.getSignedUrl({
            action: "read",
            expires: Date.now() + expiresInSeconds * 1000,
        });

        return url;
    }
}