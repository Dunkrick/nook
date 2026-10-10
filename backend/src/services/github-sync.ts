import prisma from "../prisma.js";
import type { Prisma } from "../generated/prisma/client.js";
import { PermanentGithubEventError } from "../queue/github-errors.js";

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

  return db.artifact.upsert({
    where: {
      source_externalId: {
        source: "github",
        externalId,
      },
    },
    create: {
      type: "LINK",
      source: "github",
      externalId,
      content,
      userId: repository.userId,
      workspaceId: repository.workspaceId,
    },
    update: {
      content,
    },
  });
}