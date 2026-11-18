# Ask your workspace decisions

Decisions authorized by the task brief, with alternatives and trade-offs. Revisit when implementation evidence requires it.

## P0 — Keep workspace ownership and database access in application code

- **Options considered:** let model query database; retrieve artifacts in application code and send selected evidence; send the whole workspace to model.
- **Choice:** application checks ownership and retrieves selected evidence; model only sees evidence text.
- **Reason:** explicit architecture rule; minimizes data exposure and keeps authorization outside model behavior.
- **Trade-off:** retrieval quality and coverage depend on our code; model cannot discover items our retrieval misses.

## P0 — Start with deterministic keyword and time filters

- **Options considered:** keyword scoring; embeddings/vector database; send all artifacts.
- **Choice:** plain TypeScript ranking with hard filters for time, issue state, and type.
- **Reason:** smallest reversible version; no extra service or dependency; easy to test and explain.
- **Trade-off:** paraphrases and semantic matches can be missed.

## P0 — Preserve current endpoint and domain language

- **Options considered:** new `/ai` route or rename workspace feature; workspace-scoped `/workspaces/:workspaceId/ask`.
- **Choice:** workspace-scoped route and “Ask your workspace” naming.
- **Reason:** follows existing route structure and task constraint.
- **Trade-off:** workspace id must be validated and authorized on every request.

## P0 — Use Gemini SDK behind provider-neutral client

- **Options considered:** provider calls embedded in service; provider-neutral interface with Gemini implementation; multi-provider abstraction.
- **Choice:** one small `LlmClient` interface and one Gemini implementation.
- **Reason:** lets service tests use a fake and keeps provider wire details separate.
- **Trade-off:** adds one authorized SDK and small adapter surface; model name still needs owner confirmation before P2.

## P1 — Keep retrieval deterministic and independent from database access

- **Options considered:** rank inside database query; use keyword ranking in a standalone pure function; add embeddings/vector search.
- **Choice:** `searchWorkspace` gets owned artifacts through existing service, maps them, then calls pure `rankArtifacts`.
- **Reason:** preserves ownership pattern, makes ranking testable without PostgreSQL, and gives later retrieval implementations a stable interface.
- **Trade-off:** all artifacts load into memory; exact terms miss paraphrases.

## P1 — Combine hard filters with weighted score

- **Options considered:** let recency and relevance score decide everything; apply time/type/open state as hard filters, then score keyword overlap, recency, and small type weight.
- **Choice:** use hard filters, issue-title match weight 3, other text match weight 1, recency decay up to 0.5, and type weight up to 0.01.
- **Reason:** temporal-only questions such as “this week” have no useful keywords, while “unfinished” should exclude closed issues regardless of score.
- **Trade-off:** hand-set weights are explainable but not tuned against real user judgments; keyword matching has lower recall for paraphrases.

## P1 — Treat stopword-only query as no keyword constraint

- **Options considered:** return no hits when normalized query has no words; let independent filters such as `sinceDays` determine candidates.
- **Choice:** empty normalized term list skips keyword matching; temporal filters remain hard filters.
- **Reason:** “this week” is a time constraint, not a content keyword.
- **Trade-off:** P3 must correctly translate temporal language into a filter or it may search too broadly.
