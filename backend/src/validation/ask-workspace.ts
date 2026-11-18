export interface GeneratedAnswer {
    answer: string;
    keyPoints: Array<{ title: string; summary: string }>;
    evidence: Array<{ artifactId: number; reason: string }>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasOnlyKeys(value: Record<string, unknown>, keys: string[]): boolean {
    return Object.keys(value).every((key) => keys.includes(key));
}

export function isGeneratedAnswer(value: unknown): value is GeneratedAnswer {
    if (!isRecord(value)) return false;
    if (!hasOnlyKeys(value, ["answer", "keyPoints", "evidence"])) return false;
    if (typeof value.answer !== "string" || value.answer.trim().length === 0) return false;
    if (!Array.isArray(value.keyPoints) || !Array.isArray(value.evidence)) return false;

    const validKeyPoints = value.keyPoints.every((point) =>
        isRecord(point) &&
        hasOnlyKeys(point, ["title", "summary"]) &&
        typeof point.title === "string" &&
        typeof point.summary === "string"
    );
    const validEvidence = value.evidence.every((item) =>
        isRecord(item) &&
        hasOnlyKeys(item, ["artifactId", "reason"]) &&
        Number.isInteger(item.artifactId) &&
        (item.artifactId as number) > 0 &&
        typeof item.reason === "string"
    );

    return validKeyPoints && validEvidence;
}

export function parseGeneratedAnswer(raw: string): GeneratedAnswer | null {
    const json = raw
        .trim()
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/, "")
        .trim();

    try {
        const parsed: unknown = JSON.parse(json);
        return isGeneratedAnswer(parsed) ? parsed : null;
    } catch {
        return null;
    }
}
