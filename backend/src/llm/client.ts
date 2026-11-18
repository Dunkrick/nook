export interface LlmRequest {
    systemInstruction: string;
    userPrompt: string;
    temperature: number;
}

export interface LlmToolDeclaration {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
}

export interface LlmToolCall {
    name: string;
    args: unknown;
    id?: string;
}

export interface LlmToolResult {
    name: string;
    result: Record<string, unknown>;
    callId?: string;
}

export interface LlmToolTurn {
    text: string | null;
    toolCalls: LlmToolCall[];
}

export interface LlmToolSession {
    next(toolResults?: LlmToolResult[], allowToolCalls?: boolean): Promise<LlmToolTurn>;
}

export interface LlmClient {
    generate(req: LlmRequest): Promise<string>;
    createToolSession?(
        req: LlmRequest,
        tools: LlmToolDeclaration[],
    ): LlmToolSession;
}
