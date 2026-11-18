import {
    FunctionCallingConfigMode,
    GoogleGenAI,
    type Content,
    type FunctionDeclaration,
} from "@google/genai";
import { env } from "../config/env.js";
import type {
    LlmClient,
    LlmRequest,
    LlmToolDeclaration,
    LlmToolResult,
    LlmToolTurn,
} from "./client.js";

export class GeminiLlmClient implements LlmClient {
    private readonly client: GoogleGenAI;

    constructor(
        private readonly model: string,
        apiKey: string,
        timeoutMs: number,
    ) {
        this.client = new GoogleGenAI({
            apiKey,
            httpOptions: { timeout: timeoutMs },
        });
    }

    async generate(req: LlmRequest): Promise<string> {
        const response = await this.client.models.generateContent({
            model: this.model,
            contents: req.userPrompt,
            config: {
                systemInstruction: req.systemInstruction,
                temperature: req.temperature,
                responseMimeType: "application/json",
            },
        });

        return response.text ?? "";
    }

    createToolSession(req: LlmRequest, tools: LlmToolDeclaration[]) {
        const contents: Content[] = [{
            role: "user",
            parts: [{ text: req.userPrompt }],
        }];
        const functionDeclarations: FunctionDeclaration[] = tools.map((tool) => ({
            name: tool.name,
            description: tool.description,
            parameters: tool.parameters as FunctionDeclaration["parameters"],
        }));
        let pendingModelContent: Content | null = null;

        return {
            next: async (
                toolResults: LlmToolResult[] = [],
                allowToolCalls = true,
            ): Promise<LlmToolTurn> => {
                if (pendingModelContent) {
                    contents.push(pendingModelContent);
                    pendingModelContent = null;
                }

                if (toolResults.length > 0) {
                    contents.push({
                        role: "function",
                        parts: toolResults.map((toolResult) => ({
                            functionResponse: {
                                id: toolResult.callId,
                                name: toolResult.name,
                                response: toolResult.result,
                            },
                        })),
                    });
                }

                const response = await this.client.models.generateContent({
                    model: this.model,
                    contents: [...contents],
                    config: {
                        systemInstruction: req.systemInstruction,
                        temperature: req.temperature,
                        tools: [{ functionDeclarations }],
                        toolConfig: {
                            functionCallingConfig: {
                                mode: allowToolCalls
                                    ? FunctionCallingConfigMode.AUTO
                                    : FunctionCallingConfigMode.NONE,
                            },
                        },
                    },
                });

                pendingModelContent = response.candidates?.[0]?.content ?? null;
                return {
                    text: response.text ?? null,
                    toolCalls: (response.functionCalls ?? []).flatMap((call) =>
                        call.name ? [{ name: call.name, args: call.args ?? {}, id: call.id }] : []
                    ),
                };
            },
        };
    }
}

export function createGeminiClient(): GeminiLlmClient | null {
    if (!env.API_KEY) return null;

    return new GeminiLlmClient(
        env.GEMINI_MODEL,
        env.API_KEY,
        env.LLM_TIMEOUT_MS,
    );
}
