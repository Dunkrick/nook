import "dotenv/config";
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

const MAX_ATTEMPTS = 3;
const RETRYABLE_STATUS_CODES = new Set([429, 503, 504]);

function providerStatus(error: unknown): number | null {
    if (typeof error !== "object" || error === null) return null;
    const candidate = error as { status?: unknown; statusCode?: unknown };
    const status = candidate.status ?? candidate.statusCode;
    return typeof status === "number" ? status : null;
}

async function withTransientRetry<T>(operation: () => Promise<T>): Promise<T> {
    for (let attempt = 0; ; attempt += 1) {
        try {
            return await operation();
        } catch (error) {
            const retryable = RETRYABLE_STATUS_CODES.has(providerStatus(error) ?? 0);
            if (!retryable || attempt + 1 >= MAX_ATTEMPTS) throw error;
            await new Promise((resolve) => setTimeout(resolve, 250 * (2 ** attempt)));
        }
    }
}

export class GeminiLlmClient implements LlmClient {
    private readonly client: GoogleGenAI;

    constructor(
        private readonly model: string,
        timeoutMs: number,
    ) {
        if (!process.env.API_KEY) {
            throw new Error("API_KEY is required to create the Gemini client.");
        }

        this.client = new GoogleGenAI({
            apiKey: process.env.API_KEY,
            httpOptions: { timeout: timeoutMs, retryOptions: { attempts: 1 } },
        });
    }

    async generate(req: LlmRequest): Promise<string> {
        const response = await withTransientRetry(() => this.client.models.generateContent({
            model: this.model,
            contents: req.userPrompt,
            config: {
                systemInstruction: req.systemInstruction,
                temperature: req.temperature,
                responseMimeType: "application/json",
            },
        }));

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

                const response = await withTransientRetry(() => this.client.models.generateContent({
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
                }));

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
    if (!process.env.API_KEY) return null;

    return new GeminiLlmClient(
        env.GEMINI_MODEL,
        env.LLM_TIMEOUT_MS,
    );
}
