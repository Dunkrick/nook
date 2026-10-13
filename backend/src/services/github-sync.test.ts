import { beforeEach, describe, expect, it, vi } from "vitest";

const { findRepository, findExistingArtifact, findArtifacts, upsert } = vi.hoisted(() => ({
  findRepository: vi.fn(),
  findExistingArtifact: vi.fn(),
  findArtifacts: vi.fn(),
  upsert: vi.fn(),
}));

vi.mock("../prisma.js", () => ({
  default: {
    githubRepository: { findUnique: findRepository },
    artifact: { findUnique: findExistingArtifact, findMany: findArtifacts, upsert },
  },
}));

import type { Prisma } from "../generated/prisma/client.js";
import { syncGithubIssue } from "./github-sync.js";

const database = {
  githubRepository: { findUnique: findRepository },
  artifact: { findUnique: findExistingArtifact, findMany: findArtifacts, upsert },
} as unknown as Prisma.TransactionClient;

const event = {
  action: "opened",
  repository: { name: "repo", owner: { login: "org" } },
  issue: {
    number: 7,
    title: "New issue",
    body: "Issue details",
    html_url: "https://github.com/org/repo/issues/7",
    state: "open",
    user: { login: "author" },
  },
};

describe("syncGithubIssue placement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findRepository.mockResolvedValue({ workspaceId: 12, userId: 4 });
    findExistingArtifact.mockResolvedValue(null);
    findArtifacts.mockResolvedValue([
      { type: "TEXT", x: 100, y: 100, content: { text: "Thought" } },
      { type: "POLAROID", x: 440, y: 100, content: { imageKey: "image" } },
      { type: "TEXT", x: 300, y: 430, content: { text: "Another thought" } },
    ]);
    upsert.mockResolvedValue({ id: 99 });
  });

  it("writes explicit nonzero coordinates only for newly created issues", async () => {
    await syncGithubIssue(event, database);

    expect(findExistingArtifact).toHaveBeenCalledWith({
      where: { source_externalId: { source: "github", externalId: "org/repo#7" } },
      select: { id: true },
    });
    expect(findArtifacts).toHaveBeenCalledWith({
      where: { workspaceId: 12 },
      select: { type: true, x: true, y: true, content: true },
    });
    const create = upsert.mock.calls[0][0].create;
    expect(create.x).not.toBe(0);
    expect(create.y).not.toBe(0);
    expect(upsert.mock.calls[0][0].update).not.toHaveProperty("x");
    expect(upsert.mock.calls[0][0].update).not.toHaveProperty("y");
  });

  it("does not recalculate placement or change positions for existing issues", async () => {
    findExistingArtifact.mockResolvedValue({ id: 99 });

    await syncGithubIssue(event, database);

    expect(findArtifacts).not.toHaveBeenCalled();
    expect(upsert.mock.calls[0][0].update).not.toHaveProperty("x");
    expect(upsert.mock.calls[0][0].update).not.toHaveProperty("y");
  });
});
