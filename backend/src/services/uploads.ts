import { randomUUID } from "node:crypto";

import type { ObjectStorage } from "../storage/object-storage.js";
import type { UploadFile, UploadResult } from "../types/uploads.js";
import { validateImageUpload } from "../validation/uploads.js";

export async function uploadImage(
    file: UploadFile,
    storage: ObjectStorage,
    userId: number
): Promise<UploadResult> {
    validateImageUpload(file);

    const extension = getExtension(file.contentType);

    const key =
        `uploads/users/${userId}/${randomUUID()}.${extension}`;

    return storage.upload(
        file.buffer,
        {
            key,
            contentType: file.contentType,
        }
    );
}

function getExtension(contentType: string): string {
    switch (contentType) {
        case "image/jpeg":
            return "jpg";
        case "image/png":
            return "png";
        case "image/webp":
            return "webp";
        default:
            throw new Error("Unsupported image type.");
    }
}