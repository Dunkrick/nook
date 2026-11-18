import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { LlmRequest, LlmToolDeclaration } from "./client.js";

const sdk = vi.hoisted(() => ({
    generateContent: vi.fn(),
    constructorOptions: vi.fn(),
}));

vi.mock("@google/genai", () => ({
    GoogleGenAI: class {
        models = { generateContent: sdk.generateContent };

        constructor(options: unknown) {
            sdk.constructorOptions(options);
        }
    },
    FunctionCallingConfigMode: { AUTO: "AUTO", NONE: "NONE" },
}));

import { createGeminiClient, GeminiLlmClient } from "./gemini-client.js";

const request: LlmRequest = {
    systemInstruction: "Use workspace evidence.",
    userPrompt: "Did I deploy?",
    temperature: 0,
};

const tool: LlmToolDeclaration = {
    name: "search_workspace",
    description: "Search workspace evidence.",
    parameters: { type: "object", properties: {} },
};

describe("GeminiLlmClient tool session", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubEnv("API_KEY", "test-key");
    });

    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it("keeps client optional when process.env.API_KEY is empty", () => {
        vi.stubEnv("API_KEY", "");
        expect(createGeminiClient()).toBeNull();
    });

    it("retries transient provider errors with bounded backoff", async () => {
        vi.useFakeTimers();
        sdk.generateContent
            .mockRejectedValueOnce({ status: 503 })
            .mockResolvedValueOnce({ text: "{\"answer\":\"ok\"}" });
        const client = new GeminiLlmClient("gemini-3.6-flash", 8000);

        const pending = client.generate(request);
        await vi.advanceTimersByTimeAsync(250);

        await expect(pending).resolves.toContain("ok");
        expect(sdk.generateContent).toHaveBeenCalledTimes(2);
        vi.useRealTimers();
    });

    it("stops after two retries for repeated 504 errors", async () => {
        vi.useFakeTimers();
        sdk.generateContent.mockRejectedValue({ status: 504 });
        const client = new GeminiLlmClient("gemini-3.6-flash", 8000);

        const pending = client.generate(request);
        const assertion = expect(pending).rejects.toMatchObject({ status: 504 });
        await vi.advanceTimersByTimeAsync(750);
        await assertion;

        expect(sdk.generateContent).toHaveBeenCalledTimes(3);
        vi.useRealTimers();
    });

    it("does not retry non-transient provider errors", async () => {
        sdk.generateContent.mockRejectedValue({ status: 400 });
        const client = new GeminiLlmClient("gemini-3.6-flash", 8000);

        await expect(client.generate(request)).rejects.toMatchObject({ status: 400 });
        expect(sdk.generateContent).toHaveBeenCalledTimes(1);
    });

    it("sends function declaration, returns model call, and sends tool result back", async () => {
        sdk.generateContent
            .mockResolvedValueOnce({
                text: "",
                functionCalls: [{
                    id: "call-1",
                    name: "search_workspace",
                    args: { terms: ["deploy"] },
                }],
                candidates: [{
                    content: {
                        role: "model",
                        parts: [{ functionCall: { id: "call-1", name: "search_workspace", args: { terms: ["deploy"] } } }],
                    },
                }],
            })
            .mockResolvedValueOnce({
                text: "{\"answer\":\"Found it\",\"keyPoints\":[],\"evidence\":[{\"artifactId\":1,\"reason\":\"match\"}]}",
                functionCalls: [],
                candidates: [{ content: { role: "model", parts: [{ text: "final" }] } }],
            });
        const client = new GeminiLlmClient("gemini-4-hydrogen", 8000);
        const session = client.createToolSession(request, [tool]);

        const firstTurn = await session.next();
        const finalTurn = await session.next([{
            name: "search_workspace",
            callId: "call-1",
            result: { hits: [{ artifactId: 1 }] },
        }], false);

        expect(sdk.constructorOptions).toHaveBeenCalledWith({
            apiKey: "test-key",
            httpOptions: { timeout: 8000, retryOptions: { attempts: 1 } },
        });
        expect(firstTurn.toolCalls).toEqual([{
            name: "search_workspace",
            args: { terms: ["deploy"] },
            id: "call-1",
        }]);
        expect(finalTurn.text).toContain('"answer":"Found it"');
        expect(sdk.generateContent).toHaveBeenNthCalledWith(1, expect.objectContaining({
            model: "gemini-4-hydrogen",
            contents: [{ role: "user", parts: [{ text: "Did I deploy?" }] }],
            config: expect.objectContaining({
                tools: [{ functionDeclarations: [tool] }],
                toolConfig: { functionCallingConfig: { mode: "AUTO" } },
            }),
        }));
        expect(sdk.generateContent).toHaveBeenNthCalledWith(2, expect.objectContaining({
            contents: [
                { role: "user", parts: [{ text: "Did I deploy?" }] },
                { role: "model", parts: [{ functionCall: { id: "call-1", name: "search_workspace", args: { terms: ["deploy"] } } }] },
                { role: "function", parts: [{ functionResponse: {
                    id: "call-1",
                    name: "search_workspace",
                    response: { hits: [{ artifactId: 1 }] },
                } }] },
            ],
            config: expect.objectContaining({
                toolConfig: { functionCallingConfig: { mode: "NONE" } },
            }),
        }));
    });

    it("retries transient errors during tool turns too", async () => {
        vi.useFakeTimers();
        sdk.generateContent
            .mockRejectedValueOnce({ status: 429 })
            .mockResolvedValueOnce({ text: "{\"answer\":\"ok\"}", functionCalls: [] });
        const client = new GeminiLlmClient("gemini-3.6-flash", 8000);
        const session = client.createToolSession(request, [tool]);

        const pending = session.next();
        await vi.advanceTimersByTimeAsync(250);
        await expect(pending).resolves.toMatchObject({ text: "{\"answer\":\"ok\"}" });
        expect(sdk.generateContent).toHaveBeenCalledTimes(2);
        vi.useRealTimers();
    });
});
