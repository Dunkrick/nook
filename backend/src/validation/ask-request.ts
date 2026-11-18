import { ValidationError } from "../lib/error.js";

export function parseAskQuestion(body: unknown): string {
    if (typeof body !== "object" || body === null || Array.isArray(body)) {
        throw new ValidationError("Question must be a non-empty string.");
    }

    const question = (body as Record<string, unknown>).question;
    if (typeof question !== "string" || question.trim().length === 0) {
        throw new ValidationError("Question must be a non-empty string.");
    }

    const trimmed = question.trim();
    if (trimmed.length > 300) {
        throw new ValidationError("Question must be 300 characters or fewer.");
    }

    return trimmed;
}
