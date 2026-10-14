import { describe, expect, it } from "vitest";
import type { Request } from "express";
import {
    CAPTION_MAX_LENGTH,
    validateCreateArtifact,
    validateUpdateArtifact,
} from "./artifacts.js";

function makeRequest(body: unknown) {
    return { body } as unknown as Request;
}

describe("validateCreateArtifact with a caption", () => {
    it("stores a captioned polaroid", () => {
        const req = makeRequest({
            type: "POLAROID",
            imageKey: "uploads/users/8/photo.jpg",
            caption: "  First roll  ",
            x: 10,
            y: 20,
        });

        validateCreateArtifact(req, {} as never, () => {});

        expect(req.body).toMatchObject({
            type: "POLAROID",
            imageKey: "uploads/users/8/photo.jpg",
            caption: "First roll",
            x: 10,
            y: 20,
        });
    });

    it("stores a polaroid without a caption as an empty caption", () => {
        const req = makeRequest({
            type: "POLAROID",
            imageKey: "uploads/users/8/photo.jpg",
        });

        validateCreateArtifact(req, {} as never, () => {});

        expect(req.body.caption).toBe("");
    });

    it("trims a caption that is only spaces to empty", () => {
        const req = makeRequest({
            type: "POLAROID",
            imageKey: "uploads/users/8/photo.jpg",
            caption: "   ",
        });

        validateCreateArtifact(req, {} as never, () => {});

        expect(req.body.caption).toBe("");
    });

    it("accepts a caption at the limit", () => {
        const req = makeRequest({
            type: "POLAROID",
            imageKey: "uploads/users/8/photo.jpg",
            caption: "a".repeat(CAPTION_MAX_LENGTH),
        });

        expect(() => validateCreateArtifact(req, {} as never, () => {})).not.toThrow();
        expect(req.body.caption).toHaveLength(CAPTION_MAX_LENGTH);
    });

    it("rejects a caption over the limit", () => {
        const req = makeRequest({
            type: "POLAROID",
            imageKey: "uploads/users/8/photo.jpg",
            caption: "a".repeat(CAPTION_MAX_LENGTH + 1),
        });

        expect(() => validateCreateArtifact(req, {} as never, () => {})).toThrow(
            "Caption must be 48 characters or fewer."
        );
    });

    it("rejects a caption with a newline", () => {
        const req = makeRequest({
            type: "POLAROID",
            imageKey: "uploads/users/8/photo.jpg",
            caption: "two\nlines",
        });

        expect(() => validateCreateArtifact(req, {} as never, () => {})).toThrow(
            "Caption must be on one line."
        );
    });

    it("rejects a caption that is not text", () => {
        const req = makeRequest({
            type: "POLAROID",
            imageKey: "uploads/users/8/photo.jpg",
            caption: 42,
        });

        expect(() => validateCreateArtifact(req, {} as never, () => {})).toThrow(
            "Caption must be text."
        );
    });

    it("rejects a caption on a text artifact", () => {
        const req = makeRequest({
            type: "TEXT",
            text: "a thought",
            caption: "not here",
        });

        expect(() => validateCreateArtifact(req, {} as never, () => {})).toThrow(
            "Only polaroid artifacts can have a caption."
        );
    });
});

describe("validateUpdateArtifact with a caption", () => {
    it("accepts a trimmed caption", () => {
        const req = makeRequest({ caption: "  Beach day  " });

        validateUpdateArtifact(req, {} as never, () => {});

        expect(req.body.caption).toBe("Beach day");
    });

    it("accepts an empty caption, which clears it", () => {
        const req = makeRequest({ caption: "" });

        validateUpdateArtifact(req, {} as never, () => {});

        expect(req.body.caption).toBe("");
    });

    it("treats a caption as a field to update", () => {
        const req = makeRequest({ caption: "x" });

        expect(() => validateUpdateArtifact(req, {} as never, () => {})).not.toThrow();
    });

    it("rejects a caption over the limit", () => {
        const req = makeRequest({ caption: "a".repeat(CAPTION_MAX_LENGTH + 1) });

        expect(() => validateUpdateArtifact(req, {} as never, () => {})).toThrow(
            "Caption must be 48 characters or fewer."
        );
    });

    it("rejects a caption with a carriage return and newline", () => {
        const req = makeRequest({ caption: "two\r\nlines" });

        expect(() => validateUpdateArtifact(req, {} as never, () => {})).toThrow(
            "Caption must be on one line."
        );
    });

    it("still rejects an empty request", () => {
        const req = makeRequest({});

        expect(() => validateUpdateArtifact(req, {} as never, () => {})).toThrow(
            "At least one field must be provided."
        );
    });
});
