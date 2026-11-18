# Ask your workspace — P0 recon

## What we built

This packet checks the repository against the supplied architecture facts. It records a proposed file list for packets P1 through P4. No application code changed in P0.

## Why it exists

Starting implementation before checking the real route, ownership, and data shapes could put workspace data at risk. Recon also surfaces missing configuration before the LLM packet. This keeps later changes small and reviewable.

## New AI concept(s) in plain English

- **Artifact**: one saved Nook item, such as a TEXT card or GitHub issue.
- **Evidence**: artifacts selected by our code to support an answer. Example: a GitHub issue titled “Deploy staging” could support “Did I deploy staging?” only if its saved text says so.
- **Grounding**: tying an answer to evidence we actually retrieved. It reduces unsupported claims, but does not prove every sentence true.
- **LLM (large language model)**: software trained to predict and produce text. Here, Gemini will receive a question and selected Nook evidence; it will not query PostgreSQL.
- **Prompt**: instructions and input sent to a model. Planned prompt will separate trusted rules from untrusted artifact text.
- **Retrieval**: selecting a small set of relevant saved artifacts before asking the model. P1 will use ordinary TypeScript search, not embeddings.
- **Token**: a piece of text the model processes; it may be a whole word or part of one. Tokens affect request size and cost.
- **Workspace**: Nook’s user-owned container for artifacts. Current ownership check uses `Workspace.ownerId`.

## Files touched

| file | what changed | why |
|---|---|---|
| `docs/learning/ask-workspace/00-recon.md` | Added repository findings and proposed P1–P4 file lists | Make implementation scope reviewable before coding |
| `docs/learning/ask-workspace/GLOSSARY.md` | Seeded with concepts used in this project | Give new AI terms one consistent definition |
| `docs/learning/ask-workspace/DECISIONS.md` | Recorded constraints and trade-offs from the brief | Preserve decision reasoning across packets |
| `docs/learning/ask-workspace/LOG.md` | Recorded P0 checks and environment findings | Keep dated history, including dead ends |

### Verified codebase facts

| brief claim | result |
|---|---|
| Backend at `/backend`, Express 5, Prisma 7, Vitest, ESM | Match: `backend/package.json` declares Express `^5.2.1`, Prisma `^7.8.0`, Vitest `^5.0.1`, and `"type": "module"`. Generated Prisma client output is `backend/src/generated/prisma`. |
| Layering routes → services → Prisma | Match: workspace route calls `services/workspaces.ts`; service calls `prisma`. |
| `ValidationError(message, statusCode)` and `asyncHandler` | Match: `src/lib/error.ts` defaults status to 400; wrapper lives in `src/middleware/async.ts`. |
| Artifact schema, enum, JSON content, ownership, timestamps | Match: `backend/prisma/schema.prisma` defines integer id, four enum values, JSON content, `createdAt`, `updatedAt`, `userId`, and `workspaceId`. |
| Artifact content shapes | Match: `src/domain/artifacts.ts` defines the listed TEXT, LINK, POLAROID, and GITHUB_ISSUE fields and state values. |
| `getWorkspaceArtifacts(workspaceId, userId)` and null for unowned | Match: `services/workspaces.ts` checks `workspace.ownerId`, returns null before fetching artifacts, then filters artifacts by both ids. |
| `toArtifact` mapper | Match: `src/mappers/artifact.mapper.ts` converts Prisma record into domain `Artifact`; JSON content is cast to the domain union. |
| Workspace-scoped route and desired ask path | Match: `app.ts` mounts workspace router at `/workspaces`; adding `/:workspaceId/ask` there yields requested path. |
| Environment convention and optional LLM key | Existing env uses `requiredEnv` for required values and optional defaults for OAuth keys. No `API_KEY`, model, or timeout config exists yet. P2 must add key as optional. |
| Numeric artifact ids | Match: schema and domain type both use `Int`/`number`. |
| Drag updates `updatedAt`; use `createdAt` for recency | Schema has `@updatedAt`; route allows artifact updates, so brief’s limitation is plausible. No dedicated drag code traced in P0; treat drag behavior as brief-provided, not independently verified. |
| GitHub issue bodies are external untrusted text | Match in shape/source: webhook and sync code ingest issue body. Injection risk follows from treating that text as model input; prompt text cannot make it trusted. |

### Proposed exact file lists for P1–P4

These are proposals, to confirm against code at each packet start. Shared learning files update each packet.

**P1 retrieval**

- `backend/src/services/workspace-search.ts`
- `backend/src/services/workspace-search.test.ts`
- `docs/learning/ask-workspace/01-retrieval.md`
- `docs/learning/ask-workspace/GLOSSARY.md`
- `docs/learning/ask-workspace/DECISIONS.md`
- `docs/learning/ask-workspace/LOG.md`

**P2 LLM layer**

- `backend/src/services/ask-workspace.ts` and its service test
- `backend/src/llm/client.ts`, `backend/src/llm/gemini-client.ts`, and `backend/src/llm/prompt.ts`
- `backend/src/validation/ask-workspace.ts` and its validation test
- `backend/src/config/env.ts`
- `backend/.env.example`
- `backend/package.json` and `backend/package-lock.json` (official Google Gen AI SDK only)
- `docs/learning/ask-workspace/02-llm.md`
- Shared learning files above

Exact SDK package was verified as the official `@google/genai`. Owner supplied model string `Gemini-4-Hydrogen`; public Google model docs did not verify that exact string, so remote availability remains unverified. P2 checked only that `API_KEY` exists in `backend/.env`; secret value was not printed.

**P3 route**

- `backend/src/routes/workspaces.ts`
- `backend/src/validation/ask-request.ts`
- `backend/src/services/ask-workspace.ts` (only if key/error sequencing needs route integration)
- `backend/src/routes/__tests__/workspaces-ask.test.ts`
- `docs/learning/ask-workspace/03-route.md`
- Shared learning files above

The router is mounted by existing `backend/src/app.ts`, so route should not need an app mount change. Recheck injection seam for fake LLM before touching route.

**P4 tool calling**

- `backend/src/services/ask-workspace.ts`
- `backend/src/llm/client.ts` and `backend/src/llm/gemini-client.ts` (only if SDK tool-call support requires it)
- `backend/src/services/ask-workspace.test.ts`
- `docs/learning/ask-workspace/04-tool-calling.md`
- Shared learning files above

P4 depends on stable P1–P3 behavior. Keep any additional provider changes inside these files unless repo inspection proves otherwise; ask before scope expands.

## Line-by-line walkthrough of the 2-3 most important functions

P0 adds no functions. These two existing functions establish safe retrieval boundaries for P1.

`getWorkspaceArtifacts` from `backend/src/services/workspaces.ts`:

```ts
export async function getWorkspaceArtifacts(
    workspaceId: number,
    userId: number
) {
    const workspace = await prisma.workspace.findFirst({
        where: {
            id: workspaceId,
            ownerId: userId,
        },
    });

    if (!workspace) {
        return null;
    }

    return prisma.artifact.findMany({
        where: {
            userId,
            workspaceId
        },
        orderBy: {
            createdAt: "asc",
        },
    });
}
```

- `workspaceId` and `userId` are caller-supplied numbers; route must take user id from authenticated request, never from question or model.
- `findFirst` checks workspace ownership in database.
- `where.id` selects requested workspace.
- `where.ownerId` binds workspace to authenticated user.
- `if (!workspace)` makes “missing” and “not yours” share same null result, supporting 404 without leaking existence.
- `findMany` runs only after ownership passes.
- Artifact query filters on both user and workspace id as an extra boundary.
- `createdAt` order is stable for retrieval; recency ranking may reorder in memory later.

`toArtifact` from `backend/src/mappers/artifact.mapper.ts`:

```ts
export function toArtifact(record: PrismaArtifact): Artifact {
    return {
        id: record.id,
        userId: record.userId,
        workspaceId: record.workspaceId,
        type: record.type,
        content: record.content as unknown as ArtifactContent,
        x: record.x,
        y: record.y,
        zIndex: record.zIndex,
        tint: record.tint,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
    };
}
```

- Input is generated Prisma record type.
- Return type is app’s domain type.
- Identity and ownership values remain numeric.
- `type` tells later code which JSON shape to read.
- JSON `content` is cast because Prisma’s generic JSON type does not prove the per-artifact shape. Search code must branch on `type` and use the declared union carefully.
- Position, layer, tint, and timestamps are copied without database access.
- Recency should use `createdAt`; `updatedAt` can change during edits or drags.

## How to run/test it yourself

Commands run from `backend/`:

```sh
npm run typecheck
npm test
```

Actual output on 2026-11-18:

```text
$ npm run typecheck
> nook-backend@1.0.0 typecheck
> tsc --noEmit

exit code: 0

$ npm test
> nook-backend@1.0.0 test
> vitest run src

Test Files  15 passed (15)
Tests       89 passed (89)
Duration    390ms
exit code: 0
```

First sandboxed `npm test` run failed 5 route tests with `listen EPERM: operation not permitted 127.0.0.1`; rerun after escalation passed. P0 has no new behavior test because no application code changed.

## How it can go wrong

1. Retrieval could run before ownership check and expose another user’s artifacts. Existing helper checks owner first; future search must call it before ranking.
2. Model could treat issue-body text as instructions. P2 must mark evidence as untrusted data and code must still validate model output; prompt rules alone are not a security boundary.
3. Recency could use `updatedAt` and mistake card movement for new work. Search ranking must use `createdAt`; movement limitation stays documented.

## Interview questions

1. **Why verify ownership before search?** “A workspace id is not authorization. I use authenticated user id in the ownership query before reading its artifacts.”
2. **Why retrieve evidence before calling Gemini?** “It limits model input to relevant workspace data and keeps database access in our code, where ownership checks are enforced.”
3. **Why not use `updatedAt` for recency?** “In Nook, dragging can update that timestamp, so `createdAt` is a better proxy for when the artifact entered the workspace.”

## Rating: HIGH / MEDIUM / LOW ROI for Elip, and what I must NOT claim on my resume yet

**HIGH ROI** for Elip: this project demonstrates retrieval, grounding, structured output, and trust boundaries in a familiar TypeScript service. P0 only verifies the ground; it does not implement an LLM feature. Do not claim RAG, embeddings, vector search, semantic search, agents, or a shipped AI feature yet.

### P1–P4 file list decisions

The exact proposed list and rationale appear above under “Proposed exact file lists for P1–P4.” ADR-style decision history lives in `DECISIONS.md`; each packet must revisit proposed paths if repository evidence changes.
