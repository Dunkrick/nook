import { describe, expect, it } from "vitest";
import { validateImageUpload } from "./uploads.js";

const MB = 1024 * 1024;

describe("validateImageUpload", () => {
    it("accepts JPEG images", () => {
        expect(() =>
            validateImageUpload({ contentType: "image/jpeg", size: 1 * MB }),
        ).not.toThrow();
    });

    it("accepts PNG images", () => {
        expect(() =>
            validateImageUpload({ contentType: "image/png", size: 1 * MB }),
        ).not.toThrow();
    });

    it("accepts WebP images", () => {
        expect(() =>
            validateImageUpload({ contentType: "image/webp", size: 1 * MB }),
        ).not.toThrow();
    });

    it("rejects an unsupported content type", () => {
        expect(() =>
            validateImageUpload({ contentType: "image/gif", size: 1 * MB }),
        ).toThrow("Only JPEG, PNG, and WebP images are supported.");
    });

    it("rejects a file over 10 MB", () => {
        expect(() =>
            validateImageUpload({ contentType: "image/jpeg", size: 10 * MB + 1 }),
        ).toThrow("Image must be smaller than 10 MB.");
    });

    it("accepts a file exactly at the 10 MB limit", () => {
        expect(() =>
            validateImageUpload({ contentType: "image/jpeg", size: 10 * MB }),
        ).not.toThrow();
    });
});
