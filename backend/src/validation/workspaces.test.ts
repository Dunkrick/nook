import { describe, expect, it, vi } from "vitest";
import type { Request } from "express";
import {
    parseWorkspaceId,
    validateCreateWorkspace,
    validateUpdateWorkspace,
} from "./workspaces.js";
import { ValidationError } from "../lib/error.js";

function makeRequest(body: unknown) {
    return { body } as unknown as Request;
}

describe("validateUpdateWorkspace", () => {
    it("calls next when a valid name is provided", () => {
        const req = makeRequest({ name: "Studio Space" });
        const next = vi.fn();

        validateUpdateWorkspace(req, {} as never, next);

        expect(next).toHaveBeenCalled();
    });

    it("throws ValidationError when name is missing", () => {
        const req = makeRequest({});
        const next = vi.fn();

        expect(() => validateUpdateWorkspace(req, {} as never, next)).toThrow(
            ValidationError
        );
        expect(next).not.toHaveBeenCalled();
    });

    it("throws ValidationError when name is empty string or only whitespace", () => {
        const req = makeRequest({ name: "   " });
        const next = vi.fn();

        expect(() => validateUpdateWorkspace(req, {} as never, next)).toThrow(
            ValidationError
        );
        expect(next).not.toHaveBeenCalled();
    });

    it("throws ValidationError when name is not a string", () => {
        const req = makeRequest({ name: 123 });
        const next = vi.fn();

        expect(() => validateUpdateWorkspace(req, {} as never, next)).toThrow(
            ValidationError
        );
        expect(next).not.toHaveBeenCalled();
    });
});

describe("parseWorkspaceId", () => {
    it("parses valid integer workspace IDs", () => {
        expect(parseWorkspaceId("42")).toBe(42);
    });

    it("throws ValidationError for non-integer or non-positive IDs", () => {
        expect(() => parseWorkspaceId("abc")).toThrow(ValidationError);
        expect(() => parseWorkspaceId("0")).toThrow(ValidationError);
        expect(() => parseWorkspaceId("-5")).toThrow(ValidationError);
    });
});
