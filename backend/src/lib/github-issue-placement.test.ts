import { describe, expect, it } from "vitest";
import {
  getArtifactRect,
  getGithubIssuePosition,
  getMainArtifactCluster,
} from "./github-issue-placement.js";

const cluster = [
  { type: "TEXT" as const, x: -2_000, y: -2_200, content: { text: "Thought" } },
  { type: "POLAROID" as const, x: -1_660, y: -2_200, content: { imageKey: "image" } },
  { type: "TEXT" as const, x: -1_800, y: -1_870, content: { text: "Another thought" } },
];

describe("GitHub issue placement", () => {
  it("detects main spatial cluster and rejects distant outliers", () => {
    const rects = [
      ...cluster.map(getArtifactRect),
      getArtifactRect({ type: "TEXT", x: 20_000, y: -18_000, content: { text: "far" } }),
      getArtifactRect({ type: "GITHUB_ISSUE", x: 0, y: 0, content: { title: "separate" } }),
    ];

    expect(getMainArtifactCluster(rects)).toHaveLength(3);
  });

  it("places new issue near cluster, away from overlaps, deterministically", () => {
    const artifacts = [
      ...cluster,
      { type: "TEXT" as const, x: -20_000, y: 19_000, content: { text: "far" } },
    ];
    const position = getGithubIssuePosition(artifacts, { title: "New issue" });
    const repeat = getGithubIssuePosition(artifacts, { title: "New issue" });
    const candidate = { ...position, width: 385, height: 240 };
    const mainCluster = getMainArtifactCluster(artifacts.map(getArtifactRect));
    const clusterCenter = mainCluster.reduce(
      (center, rect) => ({
        x: center.x + rect.x + rect.width / 2,
        y: center.y + rect.y + rect.height / 2,
      }),
      { x: 0, y: 0 },
    );
    clusterCenter.x /= mainCluster.length;
    clusterCenter.y /= mainCluster.length;

    expect(position).toEqual(repeat);
    expect(position).not.toEqual({ x: 0, y: 0 });
    expect(Math.hypot(
      position.x + candidate.width / 2 - clusterCenter.x,
      position.y + candidate.height / 2 - clusterCenter.y,
    )).toBeLessThan(1_000);

    for (const artifact of artifacts) {
      const rect = getArtifactRect(artifact);
      const separated = candidate.x + candidate.width + 48 <= rect.x ||
        rect.x + rect.width + 48 <= candidate.x ||
        candidate.y + candidate.height + 48 <= rect.y ||
        rect.y + rect.height + 48 <= candidate.y;
      expect(separated).toBe(true);
    }
  });

  it("chooses nonzero placement when workspace has no artifacts", () => {
    expect(getGithubIssuePosition([])).not.toEqual({ x: 0, y: 0 });
  });
});
