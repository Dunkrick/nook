import type { Artifact } from "../domain/artifacts.js";
import type { LlmClient } from "../llm/client.js";
import { buildAskPrompt } from "../llm/prompt.js";
import { parseGeneratedAnswer, type GeneratedAnswer } from "../validation/ask-workspace.js";
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
    constructor(readonly providerError: unknown) {
        super("The model request failed.");
        this.name = "LlmProviderError";
    }
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

export async function askWorkspace(
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

    const prompt = buildAskPrompt(question, hits.map(({ artifact }) => ({
        artifactId: artifact.id,
        type: artifact.type,
        createdAt: artifact.createdAt,
        text: extractSearchableText(artifact),
    })));
    let answer: GeneratedAnswer | null = null;

    for (let attempt = 0; attempt < 2 && answer === null; attempt += 1) {
        let raw: string;
        try {
            raw = await llmClient.generate(prompt);
        } catch (error) {
            throw new LlmProviderError(error);
        }
        answer = parseGeneratedAnswer(raw);
    }

    if (answer === null) throw new InvalidAskResponseError();

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
