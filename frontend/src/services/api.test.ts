import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { post } from "./api";

const fetchMock = vi.fn<typeof fetch>();

function jsonErrorResponse(error: unknown, statusText = "Not Found") {
    return {
        ok: false,
        status: 404,
        statusText,
        headers: { get: () => "application/json" },
        json: async () => ({ error }),
    } as unknown as Response;
}

describe("API error responses", () => {
    beforeEach(() => {
        fetchMock.mockReset();
        vi.stubGlobal("fetch", fetchMock);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("uses string errors returned by workspace routes", async () => {
        fetchMock.mockResolvedValue(jsonErrorResponse("Workspace not found"));

        await expect(post("/workspaces/7/ask", { question: "Anything?" }))
            .rejects.toThrow("Workspace not found");
    });

    it("uses nested validation and provider error messages", async () => {
        fetchMock.mockResolvedValue(jsonErrorResponse({ message: "Could not generate an answer. Try again." }, "Bad Gateway"));

        await expect(post("/workspaces/7/ask", { question: "Anything?" }))
            .rejects.toThrow("Could not generate an answer. Try again.");
    });

    it("falls back to HTTP status text for malformed error bodies", async () => {
        fetchMock.mockResolvedValue(jsonErrorResponse({ code: "NO_MESSAGE" }, "Not Found"));

        await expect(post("/workspaces/7/ask", { question: "Anything?" }))
            .rejects.toThrow("Not Found");
    });
});
