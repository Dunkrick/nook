import { beforeEach, describe, expect, it, vi } from "vitest";
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

import { GeminiLlmClient } from "./gemini-client.js";

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
        const client = new GeminiLlmClient("Gemini-4-Hydrogen", "test-key", 8000);
        const session = client.createToolSession(request, [tool]);

        const firstTurn = await session.next();
        const finalTurn = await session.next([{
            name: "search_workspace",
            callId: "call-1",
            result: { hits: [{ artifactId: 1 }] },
        }], false);

        expect(sdk.constructorOptions).toHaveBeenCalledWith({
            apiKey: "test-key",
            httpOptions: { timeout: 8000 },
        });
        expect(firstTurn.toolCalls).toEqual([{
            name: "search_workspace",
            args: { terms: ["deploy"] },
            id: "call-1",
        }]);
        expect(finalTurn.text).toContain('"answer":"Found it"');
        expect(sdk.generateContent).toHaveBeenNthCalledWith(1, expect.objectContaining({
            model: "Gemini-4-Hydrogen",
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
});
