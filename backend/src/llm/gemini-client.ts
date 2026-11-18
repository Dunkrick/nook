import { GoogleGenAI } from "@google/genai";
import { env } from "../config/env.js";
import type { LlmClient, LlmRequest } from "./client.js";

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
}

export function createGeminiClient(): GeminiLlmClient | null {
    if (!env.API_KEY) return null;

    return new GeminiLlmClient(
        env.GEMINI_MODEL,
        env.API_KEY,
        env.LLM_TIMEOUT_MS,
    );
}
