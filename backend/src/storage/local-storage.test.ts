import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { LocalStorage } from "./local-storage.js";

describe("LocalStorage", () => {
    let tempDir: string;

    beforeEach(async () => {
        tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "nook-local-storage-"));
    });

    afterEach(async () => {
        await fs.rm(tempDir, { recursive: true, force: true });
    });

    it("saves uploaded file buffer to disk and returns public URL", async () => {
        const storage = new LocalStorage({
            baseDir: tempDir,
            baseUrl: "https://example.com/api",
        });

        const buffer = Buffer.from("fake-image-bytes");
        const key = "uploads/users/42/photo.jpg";

        const result = await storage.upload(buffer, {
            key,
            contentType: "image/jpeg",
        });

        expect(result).toEqual({
            key: "uploads/users/42/photo.jpg",
            url: "https://example.com/api/uploads/users/42/photo.jpg",
            contentType: "image/jpeg",
            size: buffer.length,
        });

        const writtenBytes = await fs.readFile(path.join(tempDir, key));
        expect(writtenBytes.toString()).toBe("fake-image-bytes");
    });

    it("generates direct read URL matching base URL and key", async () => {
        const storage = new LocalStorage({
            baseDir: tempDir,
            baseUrl: "https://example.com/api",
        });

        const url = await storage.getSignedReadUrl("uploads/users/42/photo.jpg", 900);
        expect(url).toBe("https://example.com/api/uploads/users/42/photo.jpg");
    });
});
