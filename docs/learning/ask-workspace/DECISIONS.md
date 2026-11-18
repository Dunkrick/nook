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
- **Trade-off:** adds one authorized SDK and small adapter surface; exact model string can still be unavailable to public API.

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

## P2 — Keep provider calls behind one small interface

- **Options considered:** call Gemini directly from answer service; define provider-neutral `LlmClient` and one Gemini adapter; build multi-provider routing now.
- **Choice:** use `LlmClient.generate(req)` with official `@google/genai` implementation and fake client in tests.
- **Reason:** isolates SDK request details and keeps tests deterministic with no API call.
- **Trade-off:** one adapter adds a small layer; changing providers still requires implementation and configuration work.

## P2 — Bound and label all model context

- **Options considered:** pass all artifacts and full question; cap hits, question, and each evidence text, then wrap evidence as data; let provider context window decide.
- **Choice:** max 8 hits, 300 question characters, 1,200 evidence characters; separate system rules from user content; escape XML delimiters.
- **Reason:** limits input size and makes evidence boundary explicit while treating third-party issue text as untrusted.
- **Trade-off:** long text is truncated; delimiter escaping and system rules reduce risk but do not guarantee model ignores injection.

## P2 — Validate response and enforce citation grounding in code

- **Options considered:** trust provider JSON; validate shape and retry once; retry until valid; use model citations without checking ids.
- **Choice:** hand-written type guard, one retry for malformed output, and filter citations against retrieved ids; zero hits bypass model.
- **Reason:** provider output is untrusted; application code can enforce allowed evidence ids.
- **Trade-off:** valid but unsupported prose can still pass when it cites a valid artifact; stronger claim-level grounding needs evaluation.

## P2 — Use owner-provided model string as configurable default

- **Options considered:** replace with a public documented model; use exact supplied `Gemini-4-Hydrogen` string and allow `GEMINI_MODEL` override; block implementation until public docs list it.
- **Choice:** use owner-provided exact string, with env override.
- **Reason:** owner explicitly identified deployed model; agent must not guess a different one.
- **Trade-off:** public docs did not verify string, and no live API request checked availability.

## P3 — Validate route input before owned workspace search

- **Options considered:** accept free-form body; parse question and workspace id before service; ask model to infer a valid request.
- **Choice:** authenticated route parses positive workspace id, trims non-empty question, rejects over 300 characters, then calls service.
- **Reason:** keep request boundaries explicit and avoid retrieval for malformed input.
- **Trade-off:** simple length and type checks do not rate-limit repeated valid requests.

## P3 — Parse only known temporal and open-state phrases in code

- **Options considered:** no filter parsing; deterministic phrases; have model choose filters now.
- **Choice:** `this week` maps to seven days; `unfinished`, `open`, and `follow up` map to open-only; remove stopwords and intent words from search terms.
- **Reason:** reliable smallest baseline, testable without model, and compatible with P4 changing filter selection later.
- **Trade-off:** synonyms outside listed phrases are not understood; empty terms can broaden search unless a hard filter applies.

## P3 — Resolve ownership before returning missing-key error

- **Options considered:** fail immediately if API key missing; run owned search first, then require key only when hits need generation; require key even for fixed no-evidence answer.
- **Choice:** authenticate, validate, search; null returns 404; zero hits return fixed answer; missing key returns 503 when non-empty hits need generation.
- **Reason:** preserve P2 zero-hit grounding gate and P3 missing-key behavior without exposing workspace existence.
- **Trade-off:** no-hit requests can succeed while generation feature is otherwise unconfigured.

## P3 — Keep provider failures safe at HTTP boundary

- **Options considered:** expose provider error; pass through generic 500; log server-side and return generic 502.
- **Choice:** classify missing config as 503; provider or invalid model output as 502; log provider detail only server-side.
- **Reason:** clients get clear retry/config action without receiving provider internals.
- **Trade-off:** generic 502 is less specific for clients; server logs are needed to diagnose.

## P4 — Let model choose only retrieval filters

- **Options considered:** keep fixed P3 parsing only; expose `search_workspace` with filters; let model choose user/workspace ids or arbitrary database query.
- **Choice:** expose one function with `terms`, `sinceDays`, and `openOnly`; application executes `searchWorkspace` using authenticated user and route workspace ids.
- **Reason:** model can interpret varied wording while database access and authorization stay in TypeScript.
- **Trade-off:** model can choose poor filters; validate arguments and retain P3 deterministic fallback.

## P4 — Check ownership before model session

- **Options considered:** let model choose filters before any ownership check; check existing `getWorkspace` first, then start tool session; use `searchWorkspace` to precheck and retrieve all artifacts.
- **Choice:** call existing `getWorkspace(workspaceId, userId)` first; each actual search still calls ownership-safe `searchWorkspace`.
- **Reason:** avoid sending questions from unowned workspace to model and avoid preloading all artifacts before filter selection.
- **Trade-off:** ownership is queried again per tool search, adding small database work for stronger boundary.

## P4 — Bound tool loop and preserve P3 path

- **Options considered:** unbounded tool turns; max two searches then force final; no fallback when model fails to call tool.
- **Choice:** permit at most two supported `search_workspace` calls, set function mode to `NONE` after second, and use P3 deterministic path for unsupported, malformed, skipped, or repeated tool calls.
- **Reason:** bound latency/cost and keep feature useful when model tool behavior fails.
- **Trade-off:** model cannot keep refining after two searches; P3 fallback may use less flexible filters.

## P4 — Validate model arguments and keep identity out of tool schema

- **Options considered:** trust arguments because provider schema exists; validate allowed keys and types in application; accept identity fields as hidden arguments.
- **Choice:** accept only terms, sinceDays, and openOnly; cap terms at 12 strings of 80 characters; reject unknown fields and never pass model-provided ids.
- **Reason:** tool arguments are untrusted input; provider schema is not an authorization control.
- **Trade-off:** invalid or overlong call falls back instead of trying to repair its arguments.
