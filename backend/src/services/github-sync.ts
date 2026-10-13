import prisma from "../prisma.js";
import type { Prisma } from "../generated/prisma/client.js";
import { PermanentGithubEventError } from "../queue/github-errors.js";
import { getGithubIssuePosition } from "../lib/github-issue-placement.js";

type DbClient = Prisma.TransactionClient;

type GithubIssueEvent = {
  action: string;
  repository?: {
    name?: string;
    owner?: {
      login?: string;
    };
  };
  issue?: {
    number?: number;
    title?: string;
    body?: string | null;
    html_url?: string;
    state?: string;
    user?: {
      login?: string;
    };
    pull_request?: unknown;
  };
};

export async function syncGithubIssue(
  payload: GithubIssueEvent,
  db: DbClient = prisma,
) {
  // GitHub also sends "issues" events for pull requests.
  if (payload.issue?.pull_request) {
    return null;
  }

  const owner = payload.repository?.owner?.login;
  const name = payload.repository?.name;
  const issueNumber = payload.issue?.number;

  if (!owner || !name || !issueNumber) {
    throw new PermanentGithubEventError("Invalid GitHub issue payload: missing owner, name, or issue number");
  }

  const repository = await db.githubRepository.findUnique({
    where: {
      owner_name: {
        owner,
        name,
      },
    },
  });

  if (!repository) {
    throw new PermanentGithubEventError(
      `No Nook workspace mapped to GitHub repository ${owner}/${name}`,
    );
  }

  const supportedActions = [
    "opened",
    "edited",
    "closed",
    "reopened",
  ];

  if (!supportedActions.includes(payload.action)) {
    return null;
  }

  const externalId = `${owner}/${name}#${issueNumber}`;

  const content = {
    source: "github",
    repository: `${owner}/${name}`,
    issueNumber,
    title: payload.issue?.title ?? "",
    body: payload.issue?.body ?? "",
    state: payload.issue?.state ?? "open",
    url: payload.issue?.html_url ?? "",
    author: payload.issue?.user?.login ?? "",
  };
  const existingArtifact = await db.artifact.findUnique({
    where: {
      source_externalId: { source: "github", externalId },
    },
    select: { id: true },
  });
  let position: { x: number; y: number } | null = null;

  if (!existingArtifact) {
    const workspaceArtifacts = await db.artifact.findMany({
      where: { workspaceId: repository.workspaceId },
      select: { type: true, x: true, y: true, content: true },
    });
    position = getGithubIssuePosition(workspaceArtifacts, content);
  }
  const createPosition = position ?? getGithubIssuePosition([]);

  return db.artifact.upsert({
    where: {
      source_externalId: {
        source: "github",
        externalId,
      },
    },
    create: {
      type: "GITHUB_ISSUE",
      source: "github",
      externalId,
      content,
      x: createPosition.x,
      y: createPosition.y,
      userId: repository.userId,
      workspaceId: repository.workspaceId,
    },
    update: {
      type: "GITHUB_ISSUE",
      content,
    },
  });
}
