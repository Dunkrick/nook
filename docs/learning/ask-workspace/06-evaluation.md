# Ask your workspace — P6 evaluation

## What we built

We added 10 fixed question fixtures with small synthetic evidence snippets. The manual runner sends evidence-backed questions to Gemini and reports four simple checks in a pass/fail table. Two no-evidence fixtures use the fixed no-call path, and the runner stays outside Vitest and CI.

## Why it exists

Models can answer the same question with different words, so checking one exact sentence would make a weak evaluation. We instead check useful properties: an answer was found when evidence exists, no-evidence questions get the fixed response, citations belong to supplied evidence, and generated JSON has the expected shape. This gives a small repeatable signal when changing prompts or model settings.

## New AI concept(s) in plain English

- **LLM evaluation** means checking model behavior against a set of questions and expected properties. It helps catch regressions but does not prove model answers are correct in every case.
- **Fixture** means fixed sample input and evidence used again and again. P6 has 10 question fixtures with invented Nook-style artifact snippets; no live workspace data is read.
- **Exact match** means output must equal one reference string character by character. It is brittle here because Gemini may say “Staging deploy completed” or “The staging deployment finished” while expressing same source fact.
- **Evidence-id subset check** means every citation id in answer must appear in evidence sent for that fixture. If the model cites artifact `999` but fixture only supplies artifact `402`, check fails.
- **Pass/fail check** means one small rule reports whether a fixture met expected behavior. `should-find` checks for answer plus citation; `should-say-no-evidence` checks fixed response; other checks validate citation ids and JSON shape.

Example: fixture `staging-deploy` asks “Did the staging deployment finish?” and supplies synthetic artifact `402` saying deployment completed. Runner accepts varied wording if answer cites supplied artifact and valid JSON; it does not compare answer to a single stored sentence.

## Files touched

| file | what changed | why |
|---|---|---|
| `backend/src/ai-eval/fixtures.ts` | Added 10 fixed questions with synthetic artifact evidence and expected outcomes | Make manual checks repeatable and safe from live workspace data |
| `backend/src/ai-eval/run-eval.ts` | Added live Gemini runner, one invalid-JSON retry, four checks, and pass/fail/error table output | Inspect behavior against real model manually |
| `backend/package.json` | Added `eval:ai` command | Run evaluation without adding a dependency |
| `docs/learning/ask-workspace/06-evaluation.md` | Added this packet walkthrough | Explain method, checks, and limits |
| `docs/learning/ask-workspace/GLOSSARY.md` | Added evaluation terms | Keep new vocabulary alphabetical |
| `docs/learning/ask-workspace/DECISIONS.md` | Recorded fixture and manual-run decisions | Explain alternatives and trade-offs |
| `docs/learning/ask-workspace/LOG.md` | Recorded implementation and verification | Preserve dated history |

## Line-by-line walkthrough of the 2-3 most important functions

### `generateAnswer`

```ts
async function generateAnswer(fixture: EvalFixture): Promise<GeneratedAnswer | null> {
    if (fixture.evidence.length === 0) return noEvidenceAnswer(fixture.question);

    const client = createGeminiClient();
    if (client === null) throw new Error("API_KEY is missing. Set it in backend/.env.");
    const prompt = buildAskPrompt(fixture.question, fixture.evidence);

    for (let attempt = 0; attempt < 2; attempt += 1) {
        const parsed = parseGeneratedAnswer(await client.generate(prompt));
        if (parsed !== null) return parsed;
    }

    return null;
}
```

- No evidence means fixed response and no paid model call, matching P2 grounding gate.
- Create configured Gemini client, which reads model and key from backend environment.
- Use shared prompt builder so evaluation obeys production length caps and untrusted-evidence rules.
- Make at most two calls if JSON is invalid, matching P2 retry limit.
- Return `null` after two invalid outputs so runner marks checks failed instead of guessing.

### `evaluate`

```ts
const allowedIds = new Set(fixture.evidence.map(({ artifactId }) => artifactId));
const evidenceSubset = answer !== null && answer.evidence.every(({ artifactId }) => allowedIds.has(artifactId));
const saysNoEvidence = answer?.answer.startsWith("I couldn't find evidence of") === true && answer.evidence.length === 0;
const foundEvidence = answer !== null && answer.answer.trim().length > 0 && answer.evidence.length > 0;
```

- Build allowed citation ids from fixture evidence, not from model output.
- An empty evidence list passes subset check only when parsed answer exists; invalid output fails.
- No-evidence outcome must match fixed application response and contain no citations.
- Find outcome needs non-empty answer and at least one cited evidence item; varied natural-language wording is allowed.

### `printTable`

```ts
const failed = rows.filter((row) =>
    [row.shouldFind, row.shouldSayNoEvidence, row.evidenceSubset, row.validJson].includes("FAIL"),
);
console.log(`\n${rows.length - failed.length}/${rows.length} fixtures passed all applicable checks.`);
if (failed.length > 0) process.exitCode = 1;
```

- A row fails if any check that applies to it fails.
- `N/A` checks are excluded from failure decision, such as `should-find` on a no-evidence fixture.
- Print summary and return nonzero exit code on failure so terminal users can spot a bad run.

## How to run/test it yourself

From `backend/`:

- `npm run typecheck` — expected: TypeScript exits 0.
- `npm test` — expected: all Vitest files pass; evaluation script is not a Vitest test and does not run in CI.
- `npm run eval:ai` — makes live Gemini calls for evidence-backed fixtures, skips two no-evidence calls, prints row checks and pass/fail/error counts. Needs `API_KEY` in `.env`; `GEMINI_MODEL` selects model or defaults to `gemini-3.6-flash`. Provider request failures count as `ERROR`, not answer-behavior `FAIL`.
- Expected table has 10 rows with `PASS`, `FAIL`, `ERROR`, or `N/A` in columns `should-find`, `no-evidence`, `ids-subset`, and `valid-json`.

Actual run on 2026-11-18: `npm run typecheck` passed and `npm test` passed 19 files / 134 tests. `npm run eval:ai` exited 1 with 2/10 fixtures passing: both no-evidence cases passed; all eight generation cases received HTTP 503 or 504, so this run did not measure answer quality.

P6 uses hand-written evidence and shared single-shot prompt builder; it does not call `searchWorkspace` or the P4 tool path. It measures output shape and citation boundaries only, not real retrieval quality. The updated runner marks provider failures as `ERROR`.

The Gemini SDK default retry policy can wait much longer than our application retry. The adapter now sets SDK attempts to one and owns two retries with 250 ms and 500 ms backoff, so fixture-level provider failures can be reported without hidden multi-minute SDK backoff. After this change, live `npm run eval:ai` printed 2 PASS, 0 FAIL, 8 ERROR; all eight Gemini calls returned HTTP 429/503/504. The no-evidence fixtures passed locally without a model call; model answer quality remains unmeasured.

## How it can go wrong

1. **Provider timeout or access error.** Runner marks affected fixture checks `ERROR` and shows HTTP status only; retry later or check key/model access.
2. **Model returns malformed JSON twice.** Parser rejects it and row fails `valid-json`; one retry matches production limit.
3. **Small fixture set looks better than real usage.** Ten synthetic examples cannot represent all workspaces or wording; keep scope honest and add reviewed cases before making quality claims.

## Interview questions

1. **Why not compare exact answers?** — “Generated wording can vary while using same evidence, so I check answer presence and citation properties instead of a single sentence.”
2. **What does evidence subset protect?** — “It prevents a model from citing an artifact id our code never supplied. It does not prove answer text is fully supported.”
3. **What does this evaluation prove?** — “Only that these ten fixtures passed selected checks for this model run. It does not establish production accuracy or retrieval quality on real workspaces.”

## Rating: MEDIUM ROI for Elip, and what I must NOT claim on my resume yet

**MEDIUM ROI.** This packet shows practical model checks without brittle exact-match scoring. Do not claim comprehensive evaluation, benchmark quality, production accuracy, or reliable retrieval from these 10 synthetic fixtures.
