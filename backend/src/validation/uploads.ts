import { ValidationError } from "../lib/error.js";

const ALLOWED_IMAGE_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export function validateImageUpload(file: {
    contentType: string;
    size: number;
}) {
    if (!ALLOWED_IMAGE_TYPES.has(file.contentType)) {
        throw new ValidationError(
            "Only JPEG, PNG, and WebP images are supported."
        );
    }

    if (file.size > MAX_FILE_SIZE) {
        throw new ValidationError(
            "Image must be smaller than 10 MB."
        );
    }
}