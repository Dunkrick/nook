# Ask your workspace — P4 tool calling

## What we built

Gemini can now choose filters for one app-owned `search_workspace` function. Our service validates those filters, runs search with authenticated user and workspace ids, returns selected evidence, and permits at most two searches before forcing a final model answer. If tool use is missing, malformed, or fails, service falls back to P3’s deterministic search path.

## Why it exists

P3 parses a few exact phrases such as “this week” and “unfinished.” Natural questions can express those ideas in many ways, so P4 lets the model select only retrieval filters. The model still cannot access PostgreSQL or choose whose workspace to search; application code owns both actions and ids.

## New AI concept(s) in plain English

- **Tool calling** means model returns a structured request for application code to run a declared function. It does not run code or query the database itself.
- **Tool declaration** describes one function name, purpose, and allowed argument shape. Nook declares only `terms`, `sinceDays`, and `openOnly` for `search_workspace`.
- **Tool call** is one model-produced function name plus arguments. Example: for “Did I deploy this week?”, model may ask `search_workspace({terms:["deploy"],sinceDays:7})`.
- **Tool result** is data returned by our application after it executes a tool call. In this case, it contains up to eight matching Nook artifacts.
- **Tool loop** is the repeat pattern: model asks for search → application checks arguments and searches → application returns evidence → model may search again or answer.
- **Iteration** means one tool execution cycle. P4 allows two; then Gemini receives tool mode `NONE`, which forces final-answer mode.
- **Fallback** is backup behavior when preferred path cannot run. Unsupported tool session, malformed args, unexpected tool name, skipped tool, provider tool error, or repeated tool request falls back to P3’s deterministic filters.

Real fixture example: a question “Did I deploy staging?” enters model prompt without workspace identity. Gemini can ask for `terms:["deploy","staging"]`; our code calls `searchWorkspace(5, 10, filters)` using authenticated user `5` and route workspace `10`. Model never receives permission to replace either id.

Google’s [function-calling guide](https://ai.google.dev/gemini-api/docs/function-calling?hl=en) confirms application must execute returned calls and send function results back. The [GenerateContent API](https://ai.google.dev/api/generate-content?hl=en) documents `functionCall` and `functionResponse` fields. These docs verify API pattern, not `Gemini-4-Hydrogen` support; no live call was made.

## Files touched

| file | what changed | why |
|---|---|---|
| `backend/src/llm/client.ts` | Added provider-neutral tool declaration, call, result, turn, and session types | Keep tool loop independent of Gemini request classes |
| `backend/src/llm/gemini-client.ts` | Added Gemini function declaration, conversation history, function result handoff, and force-final mode | Translate generic session into official SDK requests |
| `backend/src/llm/gemini-client.test.ts` | Added SDK-mocked test for declaration and function-response cycle | Verify payload mapping with no network |
| `backend/src/llm/prompt.ts` | Added tool-selection prompt and shared evidence text sanitization | Tell model to search first and treat tool text as data |
| `backend/src/services/ask-workspace.ts` | Added ownership precheck, validated tool filters, two-search loop, grounding across retrieved hits, and P3 fallback | Keep ids and database operations in application code |
| `backend/src/services/ask-workspace.test.ts` | Added fake-session tests for filter selection, loop cap, empty result, id safety, and fallback | Prove tool decisions cannot set identity or exceed cap |
| `backend/src/routes/__tests__/workspaces-ask.test.ts` | Mocked ownership helper for service’s new precheck | Preserve route tests without database |
| `docs/learning/ask-workspace/04-tool-calling.md` | Added this packet walkthrough | Explain tool flow and boundaries |
| `docs/learning/ask-workspace/00-recon.md` | Updated P4 proposed file list | Keep packet scope record accurate |
| `docs/learning/ask-workspace/GLOSSARY.md` | Added tool-calling terms | Define new vocabulary |
| `docs/learning/ask-workspace/DECISIONS.md` | Recorded P4 choices and trade-offs | Preserve why loop is bounded and ids stay local |
| `docs/learning/ask-workspace/LOG.md` | Recorded P4 tests and fixes | Keep dated work history |

## Line-by-line walkthrough of the 2-3 most important functions

### `parseToolFilters`

```ts
const args = value as Record<string, unknown>;
const allowedKeys = new Set(["terms", "sinceDays", "openOnly"]);
if (!Object.keys(args).every((key) => allowedKeys.has(key))) return null;

const filters: SearchFilters = { limit: 8 };
if (args.terms !== undefined) {
    if (
        !Array.isArray(args.terms) ||
        args.terms.length > 12 ||
        !args.terms.every((term) => typeof term === "string" && term.length <= 80)
    ) return null;
    filters.terms = args.terms;
}
```

- `value` comes from model output, so code first rejects null, arrays, and non-objects.
- Allowed-key set excludes `userId`, `workspaceId`, and any other field.
- Unknown key makes arguments invalid; service uses P3 fallback instead of guessing.
- Tool search always caps returned hits at eight.
- Terms must be strings, at most 12 of them, each at most 80 characters.
- Remaining checks accept finite non-negative `sinceDays` and boolean `openOnly`; other values trigger fallback.

### `askWorkspace`

```ts
const workspace = await getWorkspace(workspaceId, userId);
if (workspace === null) return null;

if (llmClient === null || !llmClient.createToolSession) {
    return deterministicFallback(userId, workspaceId, question, filters, llmClient);
}

return answerWithTools(userId, workspaceId, question, filters, llmClient);
```

- First query checks ownership only; it reads no artifacts.
- Not-owned result returns null for route to map to 404 before any model call.
- Missing tool support or missing client goes through P3 retrieval path.
- Tool mode begins only after ownership check succeeds.

### `answerWithTools`

```ts
session = llmClient.createToolSession?.(
    buildToolAskPrompt(question),
    [SEARCH_WORKSPACE_TOOL],
);
```

- Create model session with a question and exactly one allowed tool.
- Declaration contains filters only, never identity ids.

```ts
for (let iteration = 0; turn.toolCalls.length > 0 && iteration < MAX_TOOL_ITERATIONS; iteration += 1) {
    if (turn.toolCalls.length !== 1 || turn.toolCalls[0].name !== "search_workspace") {
        return deterministicFallback(userId, workspaceId, question, filters, llmClient);
    }

    const toolFilters = parseToolFilters(turn.toolCalls[0].args);
    if (toolFilters === null) {
        return deterministicFallback(userId, workspaceId, question, filters, llmClient);
    }

    const hits = await searchWorkspace(userId, workspaceId, toolFilters);
    if (hits === null) return null;
```

- Loop count cannot exceed two searches.
- Multiple calls or wrong function name are not executed.
- Invalid model arguments are not trusted; code switches to deterministic P3 filters.
- Search receives authenticated ids from function arguments to `askWorkspace`; model cannot overwrite them.
- Search still checks workspace ownership, protecting against deletion or ownership change after initial check.

```ts
const result: LlmToolResult[] = [{
    name: "search_workspace",
    result: { hits: toolEvidence(hits) },
    callId: turn.toolCalls[0].id,
}];
turn = await nextToolTurn(session, result, iteration + 1 < MAX_TOOL_ITERATIONS);
```

- Convert hits to bounded, sanitized evidence records before returning them.
- Echo function call id so Gemini can associate result with request.
- After first iteration, tool use remains allowed.
- After second iteration, `allowToolCalls` is false; Gemini adapter sets mode `NONE` to force final answer.
- If model still asks for tool, P3 deterministic fallback runs.

## How to run/test it yourself

From `backend/`:

```sh
npm run typecheck
npm test
```

P4 output:

```text
> nook-backend@1.0.0 typecheck
> tsc --noEmit
exit code: 0

> nook-backend@1.0.0 test
> vitest run src
Test Files  19 passed (19)
Tests       133 passed (133)
exit code: 0
```

Tests use fake tool sessions or a mocked SDK; none contact Gemini or PostgreSQL.

## How it can go wrong

1. **Model includes identity ids in arguments:** validator rejects unknown keys; fallback uses user/workspace ids already passed by authenticated application code.
2. **Model loops or returns multiple/unknown calls:** code executes at most two supported calls, then disables tool calling; repeated or malformed call falls back to P3.
3. **Tool results are empty or final citations are invented:** tool mode needs one model call to choose filters; after searches yield no hits, code returns fixed no-evidence answer and ignores unsupported final text. Citation gate only accepts ids from union of retrieved hits, but cannot prove every answer sentence is true.

## Interview questions

1. **Does Gemini execute `search_workspace`?** “No. Gemini returns a structured call. My service validates arguments, runs search in TypeScript with authenticated ids, and sends result back.”
2. **Why exclude user and workspace ids from tool arguments?** “Model output is untrusted. Auth and route already know identity, so accepting ids from the model could cross workspace boundaries.”
3. **Why cap loop at two?** “It bounds latency and cost and gives a clear stop condition. After two searches, tool mode is disabled and the model must answer; if it fails, deterministic P3 path remains.”

## Rating: HIGH / MEDIUM / LOW ROI for Elip, and what I must NOT claim on my resume yet

**HIGH ROI**: P4 demonstrates controlled tool calling with app-side authorization, bounded loops, and deterministic fallback. Do not claim autonomous agents, multi-agent architecture, live Gemini-4-Hydrogen tool support, or production-ready model behavior; none were verified.
