# Ask your workspace — P1 retrieval

## What we built

We added workspace search that checks ownership before reading artifacts. It extracts text by artifact type, applies hard filters, then ranks matches by query terms, creation time, and a small type weight. The search result contains artifacts, numeric ids, scores, and matched terms for later answer generation.

## Why it exists

Without retrieval, the model would need to see too much workspace content, including unrelated or sensitive cards. Retrieval narrows later model input and keeps database access in our TypeScript service, where ownership is checked. It also gives P2 a stable seam: `searchWorkspace(userId, workspaceId, filters)` can later use a different ranking method without changing its callers.

## New AI concept(s) in plain English

- **Retrieval** means selecting relevant saved items before sending context to a model. For example, a fixture GitHub issue `nook/app #42 — Deploy release` can be selected for a “release” question while an unrelated lunch note is left out.
- **Tokenization** means splitting text into comparable pieces. This code lowercases text and splits on punctuation, so `Deploy-release` becomes `deploy` and `release`.
- **Stopwords** are common words removed because they rarely identify the topic. This implementation removes words such as “the,” “what,” “this,” and “week.” Temporal meaning belongs in `sinceDays`; “this week” alone should not act like a keyword query.
- **Ranking** means ordering candidate artifacts by a relevance score. Current score gives issue-title term matches weight 3, other text matches weight 1, adds a creation-time decay, then adds a tiny artifact-type preference.
- **Precision** means how many returned results are relevant. **Recall** means how many relevant items were found. Keyword matching favors precision and simplicity; it can miss a relevant card that uses different words, lowering recall.
- **Context window** is the maximum amount of text a model can consider in one request. Sending the whole workspace can use excess context and cost, expose unrelated content, and exceed this limit. Current code still loads all owned artifacts into backend memory before ranking, but only top hits are intended for the later model prompt.
- **Embedding** is a list of numbers that represents text and can encode meaning; **vector search** compares those lists to find similar items. Neither is used here; there is no embedding model or vector database in P1.
- **Semantic search** tries to find matching meaning even when words differ. P1 does not do this; it requires token overlap.
- **Stemming** reduces word forms to a shared base, such as “deploys” and “deployed” to “deploy.” P1 does not stem words, which is one reason exact keyword search misses matches.

## Files touched

| file | what changed | why |
|---|---|---|
| `backend/src/services/workspace-search.ts` | Added text extraction, hard filters, ranking, and ownership-safe search entry point | Keep retrieval independent and replaceable |
| `backend/src/services/workspace-search.test.ts` | Added tests for extraction, ranking, filters, and ownership | Prove required retrieval behavior without a database |
| `docs/learning/ask-workspace/01-retrieval.md` | Added this packet walkthrough | Make design choices explainable |
| `docs/learning/ask-workspace/GLOSSARY.md` | Added ranking, stopwords, and tokenization terms | Keep new vocabulary defined once |
| `docs/learning/ask-workspace/DECISIONS.md` | Recorded P1 scoring and filtering decisions | Preserve alternatives and trade-offs |
| `docs/learning/ask-workspace/LOG.md` | Recorded P1 implementation and verification | Keep dated work history |

## Line-by-line walkthrough of the 2-3 most important functions

### `extractSearchableText`

```ts
export function extractSearchableText(artifact: Artifact): string {
    switch (artifact.type) {
        case "TEXT":
            return (artifact.content as Extract<Artifact["content"], { text: string }>).text;
        case "LINK":
            return (artifact.content as Extract<Artifact["content"], { url: string }>).url;
        case "POLAROID":
            return (artifact.content as Extract<Artifact["content"], { imageKey: string }>).caption ?? "";
        case "GITHUB_ISSUE": {
            const content = issueContent(artifact);
            return `${content.repository} ${content.issueNumber} ${content.title} ${content.body} ${content.state}`;
        }
    }
}
```

- Function accepts one domain artifact and returns only searchable text.
- `switch` uses artifact type because each `content` JSON has different fields.
- TEXT searches its saved text; LINK searches URL.
- POLAROID searches caption only; image bytes/key are not useful language evidence.
- `?? ""` handles polaroids without captions.
- GitHub issues combine repository, number, title, body, and state so questions can match issue identity and content.
- `issueContent` is a typed helper for the known union member; it does not validate arbitrary malformed database JSON.

### `rankArtifacts`

```ts
const queryTerms = [...new Set((filters.terms ?? []).flatMap(tokenize))];
const typeFilter = filters.types === undefined ? null : new Set(filters.types);
const since = filters.sinceDays === undefined
    ? null
    : now.getTime() - filters.sinceDays * DAY_MS;
```

- If `terms` is missing, query has no keyword restriction.
- `tokenize` splits each supplied phrase and removes stopwords; `Set` removes duplicates.
- Missing `types` means no type restriction; an empty array means allow no types.
- `sinceDays` becomes an absolute cutoff using injected `now`, which keeps tests deterministic.

```ts
const hits = artifacts.flatMap((artifact): SearchHit[] => {
    if (typeFilter && !typeFilter.has(artifact.type)) return [];
    if (filters.openOnly && !isOpenIssue(artifact)) return [];
    if (since !== null && artifact.createdAt.getTime() < since) return [];
```

- `flatMap` emits one hit for a candidate or an empty list to discard it.
- Type, open-issue, and date checks are hard filters: no score can bring excluded artifacts back.
- `openOnly` keeps only GitHub issues whose state is exactly `open`.
- Date filtering uses `createdAt`; edits and drags can change `updatedAt` without making an artifact newly added.

```ts
const titleTokens = new Set(tokenize(searchableTitle(artifact)));
const bodyTokens = new Set(tokenize(searchableBody(artifact)));
const matchedTerms = queryTerms.filter((term) => titleTokens.has(term) || bodyTokens.has(term));
if (queryTerms.length > 0 && matchedTerms.length === 0) return [];
```

- Title and body token sets make term lookup direct.
- Query words found in either part become `matchedTerms` for explanation and later evidence display.
- If user gave real keywords but none match, candidate is omitted; a non-match cannot win from recency alone.
- If query had only stopwords such as “this week,” `queryTerms` is empty, so date filter can do its job without a fake keyword.

```ts
const titleMatches = matchedTerms.filter((term) => titleTokens.has(term)).length;
const bodyMatches = matchedTerms.filter((term) => bodyTokens.has(term)).length;
const ageDays = Math.max(0, (now.getTime() - artifact.createdAt.getTime()) / DAY_MS);
const recencyScore = 0.5 / (1 + ageDays / 30);
const score = titleMatches * 3 + bodyMatches + recencyScore + TYPE_WEIGHTS[artifact.type];
```

- Count query terms separately in title and body.
- Title overlap gets three points per distinct word; body overlap gets one.
- Future timestamps clamp to age zero so they do not gain more than maximum recency.
- Recency smoothly decays with artifact age; it contributes at most 0.5 points.
- Type weight contributes 0 to 0.01, only as a small tie nudge; issue structure gets the slight preference.
- These are simple hand-set weights, not learned from user behavior.

```ts
hits.sort((left, right) =>
    right.score - left.score ||
    right.artifact.createdAt.getTime() - left.artifact.createdAt.getTime() ||
    left.artifact.id - right.artifact.id
);
return hits.slice(0, Math.max(0, filters.limit ?? DEFAULT_LIMIT));
```

- Higher score comes first.
- Equal scores break toward newer creation time, then smaller id for stable output.
- Default result count is eight; caller may lower it or raise it. Negative limits return no hits.

### `searchWorkspace`

```ts
const records = await getWorkspaceArtifacts(workspaceId, userId);
if (records === null) return null;

return rankArtifacts(records.map(toArtifact), filters);
```

- Service takes identity and workspace id separately from search filters.
- Existing helper checks workspace owner before querying artifacts; null preserves “not owned” signal for route to map to 404.
- `toArtifact` converts Prisma records into app domain types.
- Pure ranking then runs without database access, which makes it easy to test and replace later.
- `null` means caller lacks workspace access; `[]` means owned workspace had no matching artifacts. Those outcomes must stay distinct.

## How to run/test it yourself

From `backend/`:

```sh
npm run typecheck
npm test
```

Expected: typecheck exit 0; all Vitest files pass. P1 run:

```text
> nook-backend@1.0.0 typecheck
> tsc --noEmit
exit code: 0

> nook-backend@1.0.0 test
> vitest run src
Test Files  16 passed (16)
Tests       99 passed (99)
exit code: 0
```

Test file mocks Prisma. It does not need live PostgreSQL or Gemini.

## How it can go wrong

1. **Different words, same meaning:** “ship” will not match “deploy.” Code uses exact normalized tokens without stemming or semantic search, so answer may miss a relevant artifact. Later semantic retrieval would be a separate design decision.
2. **Malformed JSON content:** mapper casts JSON to a TypeScript union but does not validate runtime shape. A malformed row may throw or produce missing text. Current tests cover valid persisted shapes; no schema validation added in P1.
3. **Very large workspace:** existing helper reads all artifacts before ranking. This avoids sending all content to the model, but memory and query cost still grow with workspace size. Pagination/indexed retrieval is outside this packet.

## Interview questions

1. **Why have `rankArtifacts` be pure?** “It has no database or clock dependency except an injectable `now`, so I can test scoring with fixed examples and replace retrieval later.”
2. **Why are date and open-state filters hard filters?** “A closed issue should never count as unfinished just because its title matches. Filters encode user intent; score only orders candidates that pass.”
3. **What is limitation of keyword retrieval?** “It matches terms, not meaning. ‘Ship’ and ‘deploy’ can refer to same event but current code may not connect them.”

## Rating: HIGH / MEDIUM / LOW ROI for Elip, and what I must NOT claim on my resume yet

**HIGH ROI**: P1 demonstrates deterministic retrieval, ownership preservation, explainable ranking, and tests before model integration. Do not claim RAG, semantic search, embeddings, vector database, or AI-generated answers; P1 has no LLM call.
