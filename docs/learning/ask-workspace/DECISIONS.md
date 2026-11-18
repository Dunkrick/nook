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
