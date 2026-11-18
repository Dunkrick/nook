import "dotenv/config";
import { createGeminiClient } from "../llm/gemini-client.js";
import { buildAskPrompt } from "../llm/prompt.js";
import type { GeneratedAnswer } from "../validation/ask-workspace.js";
import { parseGeneratedAnswer } from "../validation/ask-workspace.js";
import { evalFixtures, type EvalFixture } from "./fixtures.js";
import { fixtureResult, providerErrorRow, type EvalRow } from "./eval-result.js";

function noEvidenceAnswer(question: string): GeneratedAnswer {
    return {
        answer: `I couldn't find evidence of ${question.trim()} in your workspace.`,
        keyPoints: [],
        evidence: [],
    };
}

async function generateAnswer(fixture: EvalFixture): Promise<GeneratedAnswer | null> {
    if (fixture.evidence.length === 0) return noEvidenceAnswer(fixture.question);

    const client = createGeminiClient();
    if (client === null) throw new Error("API_KEY is missing. Set it in backend/.env.");
    const prompt = buildAskPrompt(fixture.question, fixture.evidence);

    for (let attempt = 0; attempt < 2; attempt += 1) {
        const parsed = parseGeneratedAnswer(await client.generate(prompt));
        if (parsed !== null) return parsed;
    }

    return null;
}

function evaluate(fixture: EvalFixture, answer: GeneratedAnswer | null): EvalRow {
    const generatedJson = answer === null ? null : JSON.stringify(answer);
    const reparsed = generatedJson === null ? null : parseGeneratedAnswer(generatedJson);
    const allowedIds = new Set(fixture.evidence.map(({ artifactId }) => artifactId));
    const evidenceSubset = answer !== null && answer.evidence.every(({ artifactId }) => allowedIds.has(artifactId));
    const saysNoEvidence = answer?.answer.startsWith("I couldn't find evidence of") === true && answer.evidence.length === 0;
    const foundEvidence = answer !== null && answer.answer.trim().length > 0 && answer.evidence.length > 0;

    return {
        id: fixture.id,
        expected: fixture.expectation,
        shouldFind: fixture.expectation === "should-find" ? (foundEvidence ? "PASS" : "FAIL") : "N/A",
        shouldSayNoEvidence: fixture.expectation === "should-say-no-evidence" ? (saysNoEvidence ? "PASS" : "FAIL") : "N/A",
        evidenceSubset: evidenceSubset ? "PASS" : "FAIL",
        validJson: reparsed === null ? "FAIL" : "PASS",
        skippedModel: fixture.evidence.length === 0,
        note: answer === null ? "Invalid output after retry" : "",
    };
}

function printTable(rows: EvalRow[]) {
    const headers = ["fixture", "expectation", "should-find", "no-evidence", "ids-subset", "valid-json", "model", "note"];
    const values = rows.map((row) => [
        row.id,
        row.expected,
        row.shouldFind,
        row.shouldSayNoEvidence,
        row.evidenceSubset,
        row.validJson,
        row.skippedModel ? "skipped" : "called",
        row.note,
    ]);
    const widths = headers.map((header, index) =>
        Math.max(header.length, ...values.map((value) => value[index].length)),
    );
    const format = (cells: string[]) => cells.map((cell, index) => cell.padEnd(widths[index])).join(" | ");

    console.log(format(headers));
    console.log(widths.map((width) => "-".repeat(width)).join("-+-"));
    for (const value of values) console.log(format(value));

    const counts = rows.reduce((total, row) => {
        total[fixtureResult(row)] += 1;
        return total;
    }, { PASS: 0, FAIL: 0, ERROR: 0 });
    console.log(`\n${counts.PASS} passed, ${counts.FAIL} failed, ${counts.ERROR} errored (${rows.length} fixtures).`);
    if (counts.FAIL > 0 || counts.ERROR > 0) process.exitCode = 1;
}

async function main() {
    if (!process.env.API_KEY) {
        console.error("API_KEY is missing. Set it in backend/.env before running evaluation.");
        process.exitCode = 1;
        return;
    }

    const rows: EvalRow[] = [];
    for (const fixture of evalFixtures) {
        try {
            rows.push(evaluate(fixture, await generateAnswer(fixture)));
        } catch (error) {
            const status = typeof error === "object" && error !== null && "status" in error
                ? `HTTP ${String(error.status)}`
                : "Provider error";
            rows.push(providerErrorRow(fixture, status));
        }
    }
    printTable(rows);
}

await main();
