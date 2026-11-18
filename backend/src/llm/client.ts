export interface LlmRequest {
    systemInstruction: string;
    userPrompt: string;
    temperature: number;
}

export interface LlmClient {
    generate(req: LlmRequest): Promise<string>;
}
