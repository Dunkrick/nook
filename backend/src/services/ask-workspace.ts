import type { Artifact } from "../domain/artifacts.js";
import type { LlmClient, LlmToolDeclaration, LlmToolResult, LlmToolSession, LlmToolTurn } from "../llm/client.js";
import { buildAskPrompt, buildToolAskPrompt, sanitizeEvidenceText } from "../llm/prompt.js";
import { parseGeneratedAnswer, type GeneratedAnswer } from "../validation/ask-workspace.js";
import { getWorkspace } from "./workspaces.js";
import { extractSearchableText, searchWorkspace, type SearchFilters, type SearchHit } from "./workspace-search.js";

export interface AskWorkspaceResult extends GeneratedAnswer {
    unresolvedItems: string[];
}

export class InvalidAskResponseError extends Error {
    constructor() {
        super("The model returned an invalid response. Please try again.");
        this.name = "InvalidAskResponseError";
    }
}

export class LlmUnavailableError extends Error {
    constructor() {
        super("Workspace answers are not configured.");
        this.name = "LlmUnavailableError";
    }
}

export class LlmProviderError extends Error {
    constructor(readonly providerError: unknown, readonly statusCode: number | null) {
        super("The model request failed.");
        this.name = "LlmProviderError";
    }
}

function providerStatus(error: unknown): number | null {
    if (typeof error !== "object" || error === null) return null;
    const candidate = error as { status?: unknown; statusCode?: unknown };
    const status = candidate.status ?? candidate.statusCode;
    return typeof status === "number" ? status : null;
}

const SEARCH_WORKSPACE_TOOL: LlmToolDeclaration = {
    name: "search_workspace",
    description: "Search the current user's workspace for evidence matching filters.",
    parameters: {
        type: "object",
        properties: {
            terms: {
                type: "array",
                items: { type: "string" },
                description: "Topic words to match in saved artifacts.",
            },
            sinceDays: {
                type: "number",
                description: "Only include artifacts created within this many days.",
            },
            openOnly: {
                type: "boolean",
                description: "Only include open GitHub issues.",
            },
        },
        additionalProperties: false,
    },
};

const MAX_TOOL_ITERATIONS = 2;

function parseToolFilters(value: unknown): SearchFilters | null {
    if (typeof value !== "object" || value === null || Array.isArray(value)) return null;

    const args = value as Record<string, unknown>;
    const allowedKeys = new Set(["terms", "sinceDays", "openOnly"]);
    if (!Object.keys(args).every((key) => allowedKeys.has(key))) return null;

    const filters: SearchFilters = { limit: 8 };
    if (args.terms !== undefined) {
        if (
            !Array.isArray(args.terms) ||
            args.terms.length > 12 ||
            !args.terms.every((term) => typeof term === "string" && term.length <= 80)
        ) return null;
        filters.terms = args.terms;
    }
    if (args.sinceDays !== undefined) {
        if (typeof args.sinceDays !== "number" || !Number.isFinite(args.sinceDays) || args.sinceDays < 0) return null;
        filters.sinceDays = args.sinceDays;
    }
    if (args.openOnly !== undefined) {
        if (typeof args.openOnly !== "boolean") return null;
        filters.openOnly = args.openOnly;
    }

    return filters;
}

function noEvidenceAnswer(question: string): AskWorkspaceResult {
    return {
        answer: `I couldn't find evidence of ${question.trim().slice(0, 300)} in your workspace.`,
        keyPoints: [],
        evidence: [],
        unresolvedItems: [],
    };
}

function unresolvedItems(hits: SearchHit[]): string[] {
    return hits.flatMap(({ artifact }) => {
        if (artifact.type !== "GITHUB_ISSUE") return [];
        const issue = artifact.content as Extract<Artifact["content"], { title: string }>;
        if (issue.state !== "open") return [];
        return [`${issue.repository}#${issue.issueNumber}: ${issue.title}`];
    });
}

function makePrompt(question: string, hits: SearchHit[]) {
    return buildAskPrompt(question, hits.map(({ artifact }) => ({
        artifactId: artifact.id,
        type: artifact.type,
        createdAt: artifact.createdAt,
        text: extractSearchableText(artifact),
    })));
}

async function generateFinalAnswer(
    question: string,
    hits: SearchHit[],
    llmClient: LlmClient,
    prompt = makePrompt(question, hits),
): Promise<AskWorkspaceResult> {
    if (hits.length === 0) return noEvidenceAnswer(question);

    let answer: GeneratedAnswer | null = null;
    for (let attempt = 0; attempt < 2 && answer === null; attempt += 1) {
        let raw: string;
        try {
            raw = await llmClient.generate(prompt);
        } catch (error) {
            throw new LlmProviderError(error, providerStatus(error));
        }
        answer = parseGeneratedAnswer(raw);
    }

    if (answer === null) throw new InvalidAskResponseError();

    return groundAnswer(question, hits, answer);
}

function groundAnswer(
    question: string,
    hits: SearchHit[],
    answer: GeneratedAnswer,
): AskWorkspaceResult {
    const retrievedIds = new Set(hits.map(({ artifact }) => artifact.id));
    const groundedEvidence = answer.evidence.filter(({ artifactId }) => retrievedIds.has(artifactId));
    if (groundedEvidence.length === 0) return noEvidenceAnswer(question);

    return {
        answer: answer.answer,
        keyPoints: answer.keyPoints,
        evidence: groundedEvidence,
        unresolvedItems: unresolvedItems(hits),
    };
}

async function deterministicFallback(
    userId: number,
    workspaceId: number,
    question: string,
    filters: SearchFilters,
    llmClient: LlmClient | null,
): Promise<AskWorkspaceResult | null> {
    const hits = await searchWorkspace(userId, workspaceId, filters);
    if (hits === null) return null;
    if (hits.length === 0) return noEvidenceAnswer(question);
    if (llmClient === null) throw new LlmUnavailableError();

    return generateFinalAnswer(question, hits, llmClient);
}

function toolEvidence(hits: SearchHit[]) {
    return hits.map(({ artifact }) => ({
        artifactId: artifact.id,
        type: artifact.type,
        createdAt: artifact.createdAt.toISOString(),
        text: sanitizeEvidenceText(extractSearchableText(artifact)),
    }));
}

async function nextToolTurn(
    session: LlmToolSession,
    results?: LlmToolResult[],
    allowToolCalls?: boolean,
): Promise<LlmToolTurn> {
    try {
        return await session.next(results, allowToolCalls);
    } catch (error) {
        throw new LlmProviderError(error, providerStatus(error));
    }
}

async function answerWithTools(
    userId: number,
    workspaceId: number,
    question: string,
    filters: SearchFilters,
    llmClient: LlmClient,
): Promise<AskWorkspaceResult | null> {
    let session;
    try {
        session = llmClient.createToolSession?.(
            buildToolAskPrompt(question),
            [SEARCH_WORKSPACE_TOOL],
        );
    } catch {
        return deterministicFallback(userId, workspaceId, question, filters, llmClient);
    }
    if (!session) return deterministicFallback(userId, workspaceId, question, filters, llmClient);

    let turn: LlmToolTurn;
    try {
        turn = await nextToolTurn(session);
    } catch {
        return deterministicFallback(userId, workspaceId, question, filters, llmClient);
    }
    const allHits = new Map<number, SearchHit>();
    let didSearch = false;

    for (let iteration = 0; turn.toolCalls.length > 0 && iteration < MAX_TOOL_ITERATIONS; iteration += 1) {
        if (turn.toolCalls.length !== 1 || turn.toolCalls[0].name !== "search_workspace") {
            return deterministicFallback(userId, workspaceId, question, filters, llmClient);
        }

        const toolFilters = parseToolFilters(turn.toolCalls[0].args);
        if (toolFilters === null) {
            return deterministicFallback(userId, workspaceId, question, filters, llmClient);
        }

        const hits = await searchWorkspace(userId, workspaceId, toolFilters);
        if (hits === null) return null;
        didSearch = true;
        for (const hit of hits) allHits.set(hit.artifact.id, hit);

        const result: LlmToolResult[] = [{
            name: "search_workspace",
            result: { hits: toolEvidence(hits) },
            callId: turn.toolCalls[0].id,
        }];
        if (iteration + 1 === MAX_TOOL_ITERATIONS && allHits.size === 0) {
            return noEvidenceAnswer(question);
        }
        try {
            turn = await nextToolTurn(session, result, iteration + 1 < MAX_TOOL_ITERATIONS);
        } catch {
            return deterministicFallback(userId, workspaceId, question, filters, llmClient);
        }
    }

    if (turn.toolCalls.length > 0) {
        return deterministicFallback(userId, workspaceId, question, filters, llmClient);
    }

    if (!didSearch) return deterministicFallback(userId, workspaceId, question, filters, llmClient);
    if (allHits.size === 0) return noEvidenceAnswer(question);

    const answer = parseGeneratedAnswer(turn.text ?? "");
    if (answer === null) return deterministicFallback(userId, workspaceId, question, filters, llmClient);

    return groundAnswer(question, [...allHits.values()], answer);
}

export async function askWorkspace(
    userId: number,
    workspaceId: number,
    question: string,
    filters: SearchFilters,
    llmClient: LlmClient | null,
): Promise<AskWorkspaceResult | null> {
    const workspace = await getWorkspace(workspaceId, userId);
    if (workspace === null) return null;

    if (llmClient === null || !llmClient.createToolSession) {
        return deterministicFallback(userId, workspaceId, question, filters, llmClient);
    }

    return answerWithTools(userId, workspaceId, question, filters, llmClient);
}
