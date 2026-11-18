import type { EvalFixture } from "./fixtures.js";

export type Check = "PASS" | "FAIL" | "ERROR" | "N/A";
export type FixtureResult = "PASS" | "FAIL" | "ERROR";

export interface EvalRow {
    id: string;
    expected: string;
    shouldFind: Check;
    shouldSayNoEvidence: Check;
    evidenceSubset: Check;
    validJson: Check;
    skippedModel: boolean;
    note: string;
}

export function providerErrorRow(fixture: EvalFixture, note: string): EvalRow {
    return {
        id: fixture.id,
        expected: fixture.expectation,
        shouldFind: fixture.expectation === "should-find" ? "ERROR" : "N/A",
        shouldSayNoEvidence: fixture.expectation === "should-say-no-evidence" ? "ERROR" : "N/A",
        evidenceSubset: "ERROR",
        validJson: "ERROR",
        skippedModel: fixture.evidence.length === 0,
        note,
    };
}

export function fixtureResult(row: EvalRow): FixtureResult {
    const checks = [row.shouldFind, row.shouldSayNoEvidence, row.evidenceSubset, row.validJson];
    if (checks.includes("FAIL")) return "FAIL";
    if (checks.includes("ERROR")) return "ERROR";
    return "PASS";
}
