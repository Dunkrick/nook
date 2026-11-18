import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Artifact, ArtifactType } from "../domain/artifacts.js";

const { findFirst, findMany } = vi.hoisted(() => ({
    findFirst: vi.fn(),
    findMany: vi.fn(),
}));

vi.mock("../prisma.js", () => ({
    default: {
        workspace: { findFirst },
        artifact: { findMany },
    },
}));

import {
    extractSearchableText,
    rankArtifacts,
    searchWorkspace,
} from "./workspace-search.js";

const now = new Date("2026-11-18T12:00:00.000Z");

function artifact(
    id: number,
    type: ArtifactType,
    content: Artifact["content"],
    createdAt: Date,
): Artifact {
    return {
        id,
        userId: 5,
        workspaceId: 10,
        type,
        content,
        x: 0,
        y: 0,
        zIndex: 0,
        tint: null,
        createdAt,
        updatedAt: createdAt,
    };
}

describe("extractSearchableText", () => {
    it("extracts readable fields by artifact type", () => {
        expect(extractSearchableText(artifact(1, "TEXT", { text: "Plan release" }, now)))
            .toBe("Plan release");
        expect(extractSearchableText(artifact(2, "LINK", { url: "https://example.com" }, now)))
            .toBe("https://example.com");
        expect(extractSearchableText(artifact(3, "POLAROID", { imageKey: "private/key", caption: "Whiteboard" }, now)))
            .toBe("Whiteboard");
        expect(extractSearchableText(artifact(4, "POLAROID", { imageKey: "private/key" }, now)))
            .toBe("");
        expect(extractSearchableText(artifact(5, "GITHUB_ISSUE", {
            source: "github",
            repository: "nook/app",
            issueNumber: 42,
            title: "Deploy release",
            body: "Check staging first",
            state: "open",
            url: "https://example.com/42",
            author: "Rithwick",
        }, now))).toBe("nook/app 42 Deploy release Check staging first open");
    });
});

describe("rankArtifacts", () => {
    const releaseText = artifact(1, "TEXT", { text: "release planning notes" }, now);
    const unrelatedText = artifact(2, "TEXT", { text: "team lunch ideas" }, now);

    it("ranks term matches above non-matches", () => {
        const hits = rankArtifacts([unrelatedText, releaseText], { terms: ["release"] }, now);

        expect(hits.map((hit) => hit.artifact.id)).toEqual([1]);
        expect(hits[0].matchedTerms).toEqual(["release"]);
    });

    it("ranks newer artifacts first at equal relevance", () => {
        const older = artifact(3, "TEXT", { text: "release planning" }, new Date(now.getTime() - 10 * 86400000));
        const newer = artifact(4, "TEXT", { text: "release notes" }, new Date(now.getTime() - 86400000));

        expect(rankArtifacts([older, newer], { terms: ["release"] }, now)
            .map((hit) => hit.artifact.id)).toEqual([4, 3]);
    });

    it("excludes artifacts older than sinceDays", () => {
        const old = artifact(5, "TEXT", { text: "release" }, new Date(now.getTime() - 8 * 86400000));
        const recent = artifact(6, "TEXT", { text: "release" }, new Date(now.getTime() - 2 * 86400000));

        expect(rankArtifacts([old, recent], { sinceDays: 7 }, now)
            .map((hit) => hit.artifact.id)).toEqual([6]);
    });

    it("keeps only open GitHub issues when openOnly is set", () => {
        const open = artifact(7, "GITHUB_ISSUE", {
            source: "github", repository: "nook/app", issueNumber: 7,
            title: "Release", body: "", state: "open", url: "", author: "",
        }, now);
        const closed = artifact(8, "GITHUB_ISSUE", {
            source: "github", repository: "nook/app", issueNumber: 8,
            title: "Release", body: "", state: "closed", url: "", author: "",
        }, now);
        const text = artifact(9, "TEXT", { text: "release" }, now);

        expect(rankArtifacts([open, closed, text], { openOnly: true }, now)
            .map((hit) => hit.artifact.id)).toEqual([7]);
    });

    it("returns no hits when no query terms match", () => {
        expect(rankArtifacts([releaseText], { terms: ["holiday"] }, now)).toEqual([]);
    });

    it("lets temporal-only terms defer to hard date filters", () => {
        const recent = artifact(12, "TEXT", { text: "meeting notes" }, new Date(now.getTime() - 2 * 86400000));
        const old = artifact(13, "TEXT", { text: "meeting notes" }, new Date(now.getTime() - 10 * 86400000));

        expect(rankArtifacts([recent, old], { terms: ["this", "week"], sinceDays: 7 }, now)
            .map((hit) => hit.artifact.id)).toEqual([12]);
    });

    it("applies type filters as hard filters", () => {
        expect(rankArtifacts([releaseText, unrelatedText], { types: ["TEXT"] }, now))
            .toHaveLength(2);
        expect(rankArtifacts([releaseText, unrelatedText], { types: [] }, now))
            .toEqual([]);
    });
});

describe("searchWorkspace", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns null and does not read artifacts for an unowned workspace", async () => {
        findFirst.mockResolvedValue(null);

        await expect(searchWorkspace(5, 10, {})).resolves.toBeNull();

        expect(findFirst).toHaveBeenCalledWith({
            where: { id: 10, ownerId: 5 },
        });
        expect(findMany).not.toHaveBeenCalled();
    });

    it("loads owned artifacts, maps them, then ranks them", async () => {
        findFirst.mockResolvedValue({ id: 10, ownerId: 5 });
        findMany.mockResolvedValue([{
            id: 11,
            userId: 5,
            workspaceId: 10,
            type: "TEXT",
            content: { text: "Release plan" },
            x: 0,
            y: 0,
            zIndex: 0,
            tint: null,
            createdAt: now,
            updatedAt: now,
        }]);

        const hits = await searchWorkspace(5, 10, { terms: ["release"] });

        expect(findMany).toHaveBeenCalledWith({
            where: { userId: 5, workspaceId: 10 },
            orderBy: { createdAt: "asc" },
        });
        expect(hits?.map((hit) => hit.artifact.id)).toEqual([11]);
    });
});
