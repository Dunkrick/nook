import type { Artifact, ArtifactType } from "../domain/artifacts.js";
import { toArtifact } from "../mappers/artifact.mapper.js";
import { getWorkspaceArtifacts } from "./workspaces.js";

export interface SearchFilters {
    terms?: string[];
    sinceDays?: number;
    openOnly?: boolean;
    types?: ArtifactType[];
    limit?: number;
}

export interface SearchHit {
    artifact: Artifact;
    score: number;
    matchedTerms: string[];
}

const DEFAULT_LIMIT = 8;
const DAY_MS = 24 * 60 * 60 * 1000;
const STOPWORDS = new Set([
    "a", "an", "and", "are", "as", "at", "be", "by", "for", "from",
    "has", "have", "how", "i", "in", "is", "it", "me", "my", "of",
    "on", "or", "our", "the", "this", "to", "was", "we", "week", "what", "when",
    "where", "which", "who", "why", "with", "you", "your",
]);

const TYPE_WEIGHTS: Record<ArtifactType, number> = {
    TEXT: 0,
    LINK: 0.005,
    POLAROID: 0.005,
    GITHUB_ISSUE: 0.01,
};

function tokenize(value: string): string[] {
    return value
        .toLowerCase()
        .match(/[a-z0-9]+/g)
        ?.filter((token) => !STOPWORDS.has(token)) ?? [];
}

function issueContent(artifact: Artifact) {
    return artifact.content as Extract<Artifact["content"], { title: string }>;
}

function searchableTitle(artifact: Artifact): string {
    return artifact.type === "GITHUB_ISSUE" ? issueContent(artifact).title : "";
}

function searchableBody(artifact: Artifact): string {
    if (artifact.type === "GITHUB_ISSUE") {
        const content = issueContent(artifact);
        return `${content.repository} ${content.issueNumber} ${content.body} ${content.state}`;
    }

    return extractSearchableText(artifact);
}

export function extractSearchableText(artifact: Artifact): string {
    switch (artifact.type) {
        case "TEXT":
            return (artifact.content as Extract<Artifact["content"], { text: string }>).text;
        case "LINK":
            return (artifact.content as Extract<Artifact["content"], { url: string }>).url;
        case "POLAROID":
            return (artifact.content as Extract<Artifact["content"], { imageKey: string }>).caption ?? "";
        case "GITHUB_ISSUE": {
            const content = issueContent(artifact);
            return `${content.repository} ${content.issueNumber} ${content.title} ${content.body} ${content.state}`;
        }
    }
}

function isOpenIssue(artifact: Artifact): boolean {
    return artifact.type === "GITHUB_ISSUE" && issueContent(artifact).state === "open";
}

export function rankArtifacts(
    artifacts: Artifact[],
    filters: SearchFilters,
    now = new Date(),
): SearchHit[] {
    const queryTerms = [...new Set((filters.terms ?? []).flatMap(tokenize))];
    const typeFilter = filters.types === undefined ? null : new Set(filters.types);
    const since = filters.sinceDays === undefined
        ? null
        : now.getTime() - filters.sinceDays * DAY_MS;

    const hits = artifacts.flatMap((artifact): SearchHit[] => {
        if (typeFilter && !typeFilter.has(artifact.type)) return [];
        if (filters.openOnly && !isOpenIssue(artifact)) return [];
        if (since !== null && artifact.createdAt.getTime() < since) return [];

        const titleTokens = new Set(tokenize(searchableTitle(artifact)));
        const bodyTokens = new Set(tokenize(searchableBody(artifact)));
        const matchedTerms = queryTerms.filter((term) => titleTokens.has(term) || bodyTokens.has(term));
        if (queryTerms.length > 0 && matchedTerms.length === 0) return [];

        const titleMatches = matchedTerms.filter((term) => titleTokens.has(term)).length;
        const bodyMatches = matchedTerms.filter((term) => bodyTokens.has(term)).length;
        const ageDays = Math.max(0, (now.getTime() - artifact.createdAt.getTime()) / DAY_MS);
        const recencyScore = 0.5 / (1 + ageDays / 30);
        const score = titleMatches * 3 + bodyMatches + recencyScore + TYPE_WEIGHTS[artifact.type];

        return [{ artifact, score, matchedTerms }];
    });

    hits.sort((left, right) =>
        right.score - left.score ||
        right.artifact.createdAt.getTime() - left.artifact.createdAt.getTime() ||
        left.artifact.id - right.artifact.id
    );

    return hits.slice(0, Math.max(0, filters.limit ?? DEFAULT_LIMIT));
}

export async function searchWorkspace(
    userId: number,
    workspaceId: number,
    filters: SearchFilters,
): Promise<SearchHit[] | null> {
    const records = await getWorkspaceArtifacts(workspaceId, userId);
    if (records === null) return null;

    return rankArtifacts(records.map(toArtifact), filters);
}
