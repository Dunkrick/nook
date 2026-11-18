# Ask your workspace — P3 route

## What we built

Added authenticated `POST /workspaces/:workspaceId/ask` endpoint. It validates workspace id and question, converts a few known phrases into retrieval filters, then returns grounded answers or safe errors. Ownership lookup runs before artifact search and before missing-key response, so other users’ workspace ids still return 404.

## Why it exists

P1 and P2 provide retrieval and answer generation, but nothing could call them through Nook’s API. This route connects existing auth, workspace ownership, deterministic filters, and the answer service. It also gives clients stable status codes without exposing provider error details.

## New AI concept(s) in plain English

- **Deterministic parsing** means same input always produces same parsed result by fixed code rules. Here, “this week” maps to `sinceDays: 7`, and “unfinished” maps to `openOnly: true`; no model chooses filters in P3.
- **Fallback** means backup behavior used when preferred path cannot run. P3 uses fixed no-evidence response when retrieval finds no hits, so Gemini call is skipped.
- **Safe provider error** means server logs original failure for debugging but sends generic response to client. Provider messages may include internal details and must not leak through HTTP.

Example from route tests: “What did I work on this week?” becomes `{ terms: ["work"], sinceDays: 7 }`. “Unfinished follow up” becomes `{ terms: [], openOnly: true }`. This parser is intentionally narrow; P4 may let model choose filters but must keep user/workspace ids controlled by our code.

## Files touched

| file | what changed | why |
|---|---|---|
| `backend/src/routes/workspaces.ts` | Added ask endpoint, deterministic filter parser, and 404/503/502 mapping | Reuse existing workspace route and auth stack |
| `backend/src/routes/__tests__/workspaces-ask.test.ts` | Added Supertest coverage using mocked retrieval and fake LLM client | Exercise route behavior without network or database |
| `backend/src/validation/ask-request.ts` | Added trimmed non-empty question parser with 300-character limit | Reject invalid request before retrieval |
| `backend/src/services/ask-workspace.ts` | Added missing-client and provider-error types; check owned workspace before reporting missing key | Preserve ownership behavior and classify provider failures |
| `docs/learning/ask-workspace/03-route.md` | Added this packet walkthrough | Explain route decisions and limits |
| `docs/learning/ask-workspace/00-recon.md` | Updated P3 proposed file list | Keep packet scope record accurate |
| `docs/learning/ask-workspace/GLOSSARY.md` | Added deterministic parsing and fallback | Keep new vocabulary defined |
| `docs/learning/ask-workspace/DECISIONS.md` | Recorded route, parsing, and error-handling choices | Keep alternatives and trade-offs visible |
| `docs/learning/ask-workspace/LOG.md` | Recorded P3 implementation and verification | Preserve dated work history |

## Line-by-line walkthrough of the 2-3 most important functions

### `parseAskQuestion`

```ts
export function parseAskQuestion(body: unknown): string {
    if (typeof body !== "object" || body === null || Array.isArray(body)) {
        throw new ValidationError("Question must be a non-empty string.");
    }

    const question = (body as Record<string, unknown>).question;
    if (typeof question !== "string" || question.trim().length === 0) {
        throw new ValidationError("Question must be a non-empty string.");
    }

    const trimmed = question.trim();
    if (trimmed.length > 300) {
        throw new ValidationError("Question must be 300 characters or fewer.");
    }

    return trimmed;
}
```

- Input is `unknown` because an HTTP request body is not trusted TypeScript data.
- Reject null, arrays, and non-object bodies.
- Read `question` only after checking object shape.
- Reject missing, non-string, or whitespace-only question.
- Trim outer whitespace before checking length, so harmless spaces do not count.
- 300-character cap matches prompt cap and keeps request work bounded.
- Return normalized text for filter parsing and answer generation.

### `filtersFromQuestion`

```ts
const tokens = question.toLowerCase().match(/[a-z0-9]+/g) ?? [];
const terms = [...new Set(tokens.filter((term) =>
    !QUESTION_STOPWORDS.has(term) && !OPEN_INTENT_WORDS.has(term)
))];
const filters: SearchFilters = { terms };

if (/\bthis\s+week\b/i.test(question)) filters.sinceDays = 7;
if (/\b(?:unfinished|open|follow[\s-]?up)\b/i.test(question)) filters.openOnly = true;

return filters;
```

- Lowercase and split question into word-like terms.
- Remove common question words and open-state intent words; they describe request shape, not artifact topic.
- `Set` prevents repeated terms from counting more than once in retrieval.
- Exact phrase `this week` becomes a seven-day cutoff.
- Exact intent words `unfinished`, `open`, or `follow up` switch on hard open-issue filter.
- Return only filters; authenticated ids are not part of model or parser input.
- Limitation: phrases like “recently” or “still needs work” do not map to these filters yet.

### Ask route handler

```ts
router.post(
    "/:workspaceId/ask",
    authenticate,
    asyncHandler(async (req, res) => {
        const workspaceId = parseWorkspaceId(req.params.workspaceId);
        const question = parseAskQuestion(req.body);
        const filters = filtersFromQuestion(question);

        try {
            const result = await askWorkspace(
                req.user.id,
                workspaceId,
                question,
                filters,
                createGeminiClient(),
            );

            if (result === null) {
                return res.status(404).json({ error: "Workspace not found" });
            }

            return res.status(200).json(result);
```

- Route is mounted under `/workspaces`, so final path is `/workspaces/:workspaceId/ask`.
- `authenticate` runs first and sets `req.user.id` from verified token.
- Parse id before validating body, matching required order.
- Parse question and deterministic filters before service call.
- Pass `req.user.id`, route workspace id, and filters from code. Model cannot choose ownership ids.
- `askWorkspace` calls `searchWorkspace`; null becomes 404 without disclosing whether workspace exists for another user.
- A valid result returns 200. Zero hits return fixed no-evidence response without requiring key or calling model.

```ts
} catch (error) {
    if (error instanceof LlmUnavailableError) {
        return res.status(503).json({
            success: false,
            error: { message: "Workspace answers are not configured. Set API_KEY and restart the backend." },
        });
    }

    if (error instanceof LlmProviderError) {
        console.error("Ask workspace provider request failed", error.providerError);
        const isTemporarilyUnavailable = [429, 503, 504].includes(error.statusCode ?? 0);
        return res.status(isTemporarilyUnavailable ? 503 : 502).json({
            success: false,
            error: { message: isTemporarilyUnavailable
                ? "Workspace answers are temporarily unavailable. Try again shortly."
                : "Could not generate an answer. Try again." },
        });
    }
```

- Missing API key becomes 503 only after `searchWorkspace` confirms workspace ownership.
- Provider error gets logged on server with original details.
- Client sees safe 503 for exhausted transient provider errors (429/503/504), or safe 502 for other provider failures; provider response or key details are not returned.
- Invalid model output after retry also maps to safe 502.
- Unknown failures are re-thrown to existing error handler as 500.

## How to run/test it yourself

From `backend/`:

```sh
npm run typecheck
npm test
```

P3 output:

```text
> nook-backend@1.0.0 typecheck
> tsc --noEmit
exit code: 0

> nook-backend@1.0.0 test
> vitest run src
Test Files  18 passed (18)
Tests       124 passed (124)
exit code: 0
```

Supertest tests exercise endpoint with signed test token, mocked search, and fake LLM. They do not call PostgreSQL or Gemini.

## How it can go wrong

1. **No token or bad question:** route returns 401 or 400 before retrieval; tests assert search did not run.
2. **Unowned workspace:** existing search helper returns null and route returns 404. Missing API key does not override this ownership result.
3. **Missing key/provider error:** owned workspace with non-empty hits and no key returns 503; zero hits still return fixed answer without key. Transient provider failures are retried twice, then return safe 503; other provider failures return generic 502 while server logs details. No live provider call was made in P3.

## Interview questions

1. **Why does route use authenticated user id instead of request body id?** “Request fields are user-controlled. Auth middleware supplies identity, and workspace id is checked against that identity before artifact retrieval.”
2. **Why use deterministic filters in P3?** “It gives a small predictable baseline. `this week` maps to seven days and unfinished language maps to open issues; P4 can replace intent parsing while search and ownership stay in code.”
3. **Why distinguish provider 503 from 502?** “A temporary provider capacity failure should tell the client to retry later; other provider failures remain a generic 502. Neither response exposes provider internals.”

## Rating: HIGH / MEDIUM / LOW ROI for Elip, and what I must NOT claim on my resume yet

**HIGH ROI**: P3 demonstrates secure route composition, validation, ownership checks, deterministic intent parsing, and safe provider errors. Do not claim a frontend feature, tool calling, semantic retrieval, or live Gemini success; those are not built or verified in P3.
