import type { ArtifactType } from "../domain/artifacts.js";

export interface ExistingArtifactPlacement {
  type: ArtifactType;
  x: number;
  y: number;
  content?: unknown;
}

export interface ArtifactRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

const ISSUE_WIDTH = 385;
const PLACEMENT_GAP = 48;

function contentString(content: unknown, key: string) {
  if (!content || typeof content !== "object" || !(key in content)) return "";
  const value = (content as Record<string, unknown>)[key];
  return typeof value === "string" ? value : "";
}

export function getArtifactRect(artifact: ExistingArtifactPlacement): ArtifactRect {
  const textHeight = (value: string, charsPerLine: number, lineHeight: number) =>
    Math.max(160, 174 + Math.ceil(value.length / charsPerLine) * lineHeight);
  let width = 380;
  let height = 220;

  if (artifact.type === "POLAROID") {
    width = 280;
    height = 320;
  } else if (artifact.type === "TEXT") {
    height = textHeight(contentString(artifact.content, "text"), 32, 25);
  } else if (artifact.type === "LINK") {
    height = textHeight(contentString(artifact.content, "url"), 34, 26);
  } else if (artifact.type === "GITHUB_ISSUE") {
    const title = contentString(artifact.content, "title");
    height = 200 + Math.ceil(title.length / 36) * 26;
  }

  return { x: artifact.x, y: artifact.y, width, height };
}

function centerOf(rect: ArtifactRect) {
  return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
}

export function getMainArtifactCluster<T extends ArtifactRect>(rects: T[]): T[] {
  if (rects.length <= 1) return rects;

  const diagonals = rects
    .map((rect) => Math.hypot(rect.width, rect.height))
    .sort((a, b) => a - b);
  const proximity = diagonals[Math.floor(diagonals.length / 2)] * 1.5;
  const remaining = new Set(rects.map((_, index) => index));
  const clusters: T[][] = [];

  while (remaining.size > 0) {
    const first = remaining.values().next().value as number;
    remaining.delete(first);
    const queue = [first];
    const cluster: T[] = [];

    while (queue.length > 0) {
      const index = queue.shift()!;
      const center = centerOf(rects[index]);
      cluster.push(rects[index]);

      for (const candidate of remaining) {
        const other = centerOf(rects[candidate]);
        if (Math.hypot(center.x - other.x, center.y - other.y) <= proximity) {
          remaining.delete(candidate);
          queue.push(candidate);
        }
      }
    }

    clusters.push(cluster);
  }

  return clusters.reduce((largest, cluster) =>
    cluster.length > largest.length ? cluster : largest,
  );
}

function overlaps(a: ArtifactRect, b: ArtifactRect, gap: number) {
  return a.x < b.x + b.width + gap &&
    a.x + a.width + gap > b.x &&
    a.y < b.y + b.height + gap &&
    a.y + a.height + gap > b.y;
}

export function getGithubIssuePosition(
  artifacts: ExistingArtifactPlacement[],
  issueContent: { title: string } = { title: "" },
) {
  const existing = artifacts.map(getArtifactRect);
  const anchor = existing.length === 0
    ? [{ x: -130, y: -80, width: 260, height: 160 }]
    : getMainArtifactCluster(existing);
  const maxX = Math.max(...anchor.map((rect) => rect.x + rect.width));
  const centerY = anchor.reduce(
    (sum, rect) => sum + centerOf(rect).y,
    0,
  ) / anchor.length;
  const issueHeight = 200 + Math.ceil(issueContent.title.length / 36) * 26;
  const baseY = centerY - issueHeight / 2;

  for (let index = 0; index < 10_000; index += 1) {
    const column = Math.floor(index / 5);
    const rowIndex = index % 5;
    const row = rowIndex === 0 ? 0 : Math.ceil(rowIndex / 2) * (rowIndex % 2 ? 1 : -1);
    const candidate = {
      x: maxX + PLACEMENT_GAP + column * (ISSUE_WIDTH + PLACEMENT_GAP),
      y: baseY + row * (issueHeight + PLACEMENT_GAP),
      width: ISSUE_WIDTH,
      height: issueHeight,
    };

    if (!existing.some((rect) => overlaps(candidate, rect, PLACEMENT_GAP))) {
      return { x: candidate.x, y: candidate.y };
    }
  }

  throw new Error("Could not find open placement for GitHub issue artifact");
}
