import { describe, expect, it } from "vitest";
import { evalFixtures } from "./fixtures.js";
import { fixtureResult, providerErrorRow } from "./eval-result.js";

describe("evaluation provider error results", () => {
    it("records provider errors as ERROR, not FAIL", () => {
        const row = providerErrorRow(evalFixtures[0], "HTTP 503");

        expect(row.shouldFind).toBe("ERROR");
        expect(row.evidenceSubset).toBe("ERROR");
        expect(fixtureResult(row)).toBe("ERROR");
    });

    it("keeps real assertion failures classified as FAIL", () => {
        const row = {
            ...providerErrorRow(evalFixtures[0], "HTTP 503"),
            shouldFind: "FAIL" as const,
        };

        expect(fixtureResult(row)).toBe("FAIL");
    });
});
