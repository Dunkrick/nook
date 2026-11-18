import { env } from "../config/env.js";
import type { ObjectStorage } from "./object-storage.js";
import { S3Storage } from "./s3-storage.js";
import { GoogleCloudStorage } from "./google-cloud-storage.js";
import { LocalStorage } from "./local-storage.js";

export function getObjectStorage(): ObjectStorage {
    if (env.STORAGE_PROVIDER === "s3" && env.S3_BUCKET_NAME) {
        return new S3Storage();
    }
    if (env.STORAGE_PROVIDER === "gcs" && env.GCS_BUCKET_NAME) {
        return new GoogleCloudStorage(env.GCS_BUCKET_NAME);
    }
    return new LocalStorage();
}
