import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { ObjectStorage, StoredObject } from "./object-storage.js";
import { env } from "../config/env.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface LocalStorageOptions {
    baseDir?: string;
    baseUrl?: string;
}

export class LocalStorage implements ObjectStorage {
    private readonly baseDir: string;
    private readonly baseUrl: string;

    constructor(options?: LocalStorageOptions) {
        this.baseDir = options?.baseDir ?? path.resolve(__dirname, "../../public");
        this.baseUrl = (options?.baseUrl ?? env.BACKEND_URL).replace(/\/+$/, "");
    }

    async upload(
        buffer: Buffer,
        metadata: {
            key: string;
            contentType: string;
        },
    ): Promise<StoredObject> {
        const cleanKey = metadata.key.replace(/^\/+/, "");
        const filePath = path.join(this.baseDir, cleanKey);

        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, buffer);

        return {
            key: cleanKey,
            url: `${this.baseUrl}/${cleanKey}`,
            contentType: metadata.contentType,
            size: buffer.length,
        };
    }

    async getSignedReadUrl(
        key: string,
        _expiresInSeconds: number,
    ): Promise<string> {
        const cleanKey = key.replace(/^\/+/, "");
        return `${this.baseUrl}/${cleanKey}`;
    }
}
