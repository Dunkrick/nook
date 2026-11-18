# Ask your workspace — P2 LLM layer

## What we built

Added provider-neutral `LlmClient` and Gemini implementation using Google’s official GenAI SDK. Added bounded prompt construction, hand-written JSON validation with one retry, and grounding checks that allow only retrieved evidence ids. Open GitHub issues become unresolved items in our code; empty retrieval returns a fixed answer without a model call.

## Why it exists

Retrieval finds candidate facts, but it does not turn them into a useful answer. The LLM layer sends only selected evidence to Gemini, then our code validates its shape and limits which artifacts it may cite. Keeping this layer behind an interface lets tests use a fake client and avoids making test results depend on network access or model output.

## New AI concept(s) in plain English

- **LLM call**: one network request that sends text to a model and receives generated text. Here, our code sends a question plus up to eight retrieved artifacts; Gemini does not query Nook’s database.
- **API key**: secret credential that lets Google identify and authorize API requests. `API_KEY` is optional in `env.ts`; `createGeminiClient()` returns null if absent, so app startup does not depend on the key.
- **Token**: small piece of text processed by a model, often a whole word or word fragment. Input and output tokens affect usage cost; exact Gemini pricing was not checked for this packet.
- **Context window**: maximum amount of tokenized input and output a model can handle in one request. P2 caps question length, evidence count, and each evidence text to keep requests bounded.
- **Prompt**: instructions and content sent with an LLM call. Nook prompt includes rules plus a user question and selected evidence.
- **System message**: trusted application instructions that set model behavior. **User message**: request content for this call, including question and evidence. Gemini SDK maps these to `systemInstruction` and `contents` separately.
- **Temperature**: setting that controls output randomness. We use `0` for steadier answers; this does not guarantee identical responses every time.
- **Structured output**: model response intended to follow a known data shape. Gemini JSON mode requests JSON, while our type guard still checks every required field and type.
- **Hallucination**: plausible-sounding content not supported by source facts. P2 drops citations with ids outside retrieved evidence; this cannot prove every sentence is true.
- **Grounding**: linking answer citations to artifacts our code retrieved. Example: fake issue `nook/app#7 — Issue 7` can be cited because id 7 was in the supplied hits; model cannot make a citation to id 999 pass the gate.
- **Prompt injection**: untrusted text that tries to override model instructions. A GitHub issue body saying “Ignore all rules” remains data, gets escaped before entering evidence tags, and never becomes executable code. System instructions help, but cannot guarantee model resistance.
- **Retry**: repeat a failed operation once. P2 retries only malformed or wrong-shaped model output once; provider/network errors go to P3 for safe HTTP handling.
- **JSON mode**: provider setting that requests JSON text. It does not validate JSON shape, so local validation remains necessary.

Model choice history: owner supplied `Gemini-4-Hydrogen`; this was tested and returned `WORKING` twice, with one HTTP 504 timeout. Current default is `gemini-3.6-flash`, which AI Studio lists as Stable; `GEMINI_MODEL` can override it. The stable fallback request returned HTTP 503 during this update, so current availability was not verified. This does not establish tool-calling support. Official SDK use follows Google’s [GenAI SDK guide](https://ai.google.dev/gemini-api/docs/libraries?hl=en) and [generate content examples](https://ai.google.dev/api/generate-content?hl=en).

Credential wiring: `dotenv/config` loads `backend/.env` before the SDK client reads `process.env.API_KEY`. The optional factory returns `null` if the variable is missing, so backend can boot without a Gemini key. `backend/scripts/verify-gemini.ts` sends a one-line request to `gemini-3.6-flash` by default, accepts a model argument, and prints response text but never the key.

Transport retry follow-up: Gemini adapter retries only HTTP 429, 503, and 504, for three total attempts with 250 ms then 500 ms backoff. SDK retries are set to one attempt so its built-in longer retry policy cannot multiply these attempts. The 15-second timeout applies per request, so worst-case total time can exceed 15 seconds. Both text generation and tool turns use the same retry wrapper.

Earlier live attempts on 2026-11-18: `gemini-2.5-flash` returned HTTP 404; `gemini-3.8-flash` and `gemini-3.7-flash` returned HTTP 503. The latest `gemini-3.6-flash` probe returned HTTP 503 both inside and outside the network sandbox. These are availability observations, not proof that the listed model id is invalid.

## Files touched

| file | what changed | why |
|---|---|---|
| `backend/src/llm/client.ts` | Added provider-neutral request and client interfaces | Let service tests use fake client |
| `backend/src/llm/gemini-client.ts` | Added SDK adapter, JSON mode, temperature, timeout, dotenv loading, and `process.env.API_KEY` wiring | Keep provider details out of service and use the documented local key |
| `backend/src/llm/gemini-client.test.ts` | Checked SDK constructor receives `process.env.API_KEY` | Prevent credential source regressions |
| `backend/scripts/verify-gemini.ts` | Added live one-prompt script; now defaults to `gemini-3.6-flash` | Verify local key and model access without exposing secret |
| `backend/package.json` | Added `verify:gemini` script | Run live verification with one command; optional model argument supports fallback checks |
| `backend/src/llm/prompt.ts` | Added system rules, evidence wrapping, escaping, and length caps | Bound model input and label external text as data |
| `backend/src/services/ask-workspace.ts` | Added retrieve → prompt → validate → ground flow and code-derived unresolved issues | Keep database access and grounding gate in application code |
| `backend/src/services/ask-workspace.test.ts` | Added fake-client tests for validation, retry, caps, injection, and grounding | No network or real model required in tests |
| `backend/src/validation/ask-workspace.ts` | Added handwritten type guard and fenced-JSON parser | Validate untrusted model response without another dependency |
| `backend/src/config/env.ts` | Added optional key, model, and timeout settings | Missing key must not stop app startup |
| `backend/.env.example` | Documented optional Gemini variables | Show local setup without exposing a key |
| `backend/package.json`, `backend/package-lock.json` | Added `@google/genai`, Google’s official SDK | Make real provider implementation possible |
| `docs/learning/ask-workspace/00-recon.md` | Marked model as supplied; added `.env.example` to P2 path proposal | Keep recon current |
| `docs/learning/ask-workspace/GLOSSARY.md` | Added P2 AI terms | Keep concepts alphabetical and defined |
| `docs/learning/ask-workspace/DECISIONS.md` | Added P2 provider, prompt, and grounding decisions | Explain alternatives and trade-offs |
| `docs/learning/ask-workspace/LOG.md` | Recorded key/model checks, install, bugs, and verification | Preserve work history |

`backend/.env` was not changed or printed. P2 checked only that `API_KEY` is present.

## Line-by-line walkthrough of the 2-3 most important functions

### `buildAskPrompt`

```ts
export function buildAskPrompt(question: string, items: PromptEvidence[]): LlmRequest {
    const evidence = items.slice(0, MAX_EVIDENCE_ITEMS).map((item) => ({
        artifactId: item.artifactId,
        type: item.type,
        createdAt: item.createdAt.toISOString(),
        text: escapeEvidenceText(item.text.slice(0, MAX_EVIDENCE_TEXT_CHARS)),
    }));

    return {
        systemInstruction: SYSTEM_INSTRUCTION,
        userPrompt: `Question:\n${question.slice(0, MAX_QUESTION_CHARS)}\n\n<evidence>\n${JSON.stringify(evidence)}\n</evidence>`,
        temperature: 0,
    };
}
```

- Input is a question and already-selected evidence records; no database call occurs here.
- `slice(0, 8)` caps evidence item count.
- `artifactId` stays numeric so later code can check it against retrieved ids.
- `type` and ISO `createdAt` give model context and make evidence traceable.
- Text is truncated to 1,200 source characters, then `<`, `>`, and `&` are escaped so artifact text cannot close the evidence tag.
- Return separates system rules from user content.
- Question is limited to 300 characters.
- `temperature: 0` asks Gemini for low-randomness output.

### `askWorkspace`

```ts
const hits = await searchWorkspace(userId, workspaceId, filters);
if (hits === null) return null;
if (hits.length === 0) return noEvidenceAnswer(question);

const prompt = buildAskPrompt(question, hits.map(({ artifact }) => ({
    artifactId: artifact.id,
    type: artifact.type,
    createdAt: artifact.createdAt,
    text: extractSearchableText(artifact),
})));
```

- Search receives authenticated user/workspace identity as separate arguments.
- Null means not owned; service preserves that outcome for route to return 404.
- Empty list means owned workspace but no match; return fixed answer before any LLM call.
- Only retrieved artifacts get converted to prompt evidence.

```ts
for (let attempt = 0; attempt < 2 && answer === null; attempt += 1) {
    answer = parseGeneratedAnswer(await llmClient.generate(prompt));
}
if (answer === null) throw new InvalidAskResponseError();

const retrievedIds = new Set(hits.map(({ artifact }) => artifact.id));
const groundedEvidence = answer.evidence.filter(({ artifactId }) => retrievedIds.has(artifactId));
if (groundedEvidence.length === 0) return noEvidenceAnswer(question);
```

- At most two calls: original and one retry, only while parsed output is invalid.
- Clean error after second invalid response; provider details are not placed in this error.
- Build allow-list from ids selected by search.
- Keep only model citations in that allow-list.
- If none survive, discard generated answer and return fixed no-evidence answer. This is a code gate, not a prompt request.

```ts
return {
    answer: answer.answer,
    keyPoints: answer.keyPoints,
    evidence: groundedEvidence,
    unresolvedItems: unresolvedItems(hits),
};
```

- Return only expected model fields plus evidence filtered by our code.
- `unresolvedItems` is computed from open GitHub issue hits, never accepted from model JSON.

### `GeminiLlmClient.generate`

```ts
async generate(req: LlmRequest): Promise<string> {
    const response = await this.client.models.generateContent({
        model: this.model,
        contents: req.userPrompt,
        config: {
            systemInstruction: req.systemInstruction,
            temperature: req.temperature,
            responseMimeType: "application/json",
        },
    });

    return response.text ?? "";
}
```

- Adapter implements the provider-neutral interface.
- `model` uses exact configured model string.
- `contents` carries user question and evidence; `systemInstruction` carries rules.
- JSON mode asks for JSON; it does not replace our validator.
- The client’s `httpOptions.timeout` bounds remote request time.
- Empty text flows to parser and gets one retry, then a clean error.

### Credential setup

```ts
import "dotenv/config";

constructor(private readonly model: string, timeoutMs: number) {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY is required to create the Gemini client.");
    }

    this.client = new GoogleGenAI({
        apiKey: process.env.API_KEY,
        httpOptions: { timeout: timeoutMs },
    });
}
```

- Importing `dotenv/config` reads `.env` into `process.env` before this module constructs the SDK client.
- Check for a missing key before SDK construction; the route-level factory returns `null` when unset, preserving optional-key app startup.
- Pass `process.env.API_KEY` explicitly into the official SDK config after checking it exists.
- The key stays in backend process memory and is never included in script output or prompt text.

## How to run/test it yourself

From `backend/`:

```sh
npm run typecheck
npm test
npm run verify:gemini
npm run verify:gemini -- gemini-3.8-flash
```

P2 output:

```text
> nook-backend@1.0.0 typecheck
> tsc --noEmit
exit code: 0

> nook-backend@1.0.0 test
> vitest run src
Test Files  17 passed (17)
Tests       111 passed (111)
exit code: 0
```

Tests use fake `LlmClient`; no Google API request or live database needed. The verification script makes one live request, defaults to `gemini-3.6-flash`, and accepts an optional model argument. Successful output starts `Gemini verification passed` and contains `WORKING`. This live request checks current key/model access only; it does not validate production endpoint behavior.

Actual terminal output on 2026-11-18:

```text
$ npm run verify:gemini
Gemini verification failed (gemini-2.5-flash) (HTTP 404). Check model access and backend logs.

$ npm run verify:gemini -- gemini-3.8-flash
Gemini verification failed (gemini-3.8-flash) (HTTP 503). Check model access and backend logs.

$ npm run verify:gemini -- gemini-3.7-flash
Gemini verification failed (gemini-3.7-flash) (HTTP 503). Check model access and backend logs.

$ npm run verify:gemini
Gemini verification passed (gemini-4-hydrogen): WORKING

$ npm run verify:gemini (repeat)
Gemini verification failed (gemini-4-hydrogen) (HTTP 504). Check model access and backend logs.

$ npm run verify:gemini (retry)
Gemini verification passed (gemini-4-hydrogen): WORKING
```

## How it can go wrong

1. **No API key:** `API_KEY` defaults to empty; app still boots and client factory returns null. P3 must turn that into clear 503 response.
2. **Bad model output:** JSON may be malformed or wrong-shaped. Parser retries once, then throws `InvalidAskResponseError`; route returns safe 502. Gemini transport retries only 429/503/504 twice with backoff; exhausted transient errors return safe 503.
3. **Prompt injection or false claims:** issue body can contain attack text, so prompt marks it untrusted and escapes evidence delimiters. Model may still be influenced or make unsupported claims; tests prove code filtering behavior only, not real model resistance. Citation gate only guarantees cited ids came from retrieval.

## Interview questions

1. **Why use a provider interface if only Gemini exists?** “It lets answer logic depend on a small contract and lets tests provide a fake, while Gemini request details stay in one adapter.”
2. **Why JSON mode and a local type guard?** “JSON mode improves format compliance, but model output is still untrusted text. The guard checks shape before code uses ids or fields.”
3. **Does grounding make answer true?** “No. It proves citation ids came from retrieved workspace items. It does not prove model summary is fully supported, so stronger claim-level checks need later evaluation.”

## Rating: HIGH / MEDIUM / LOW ROI for Elip, and what I must NOT claim on my resume yet

**HIGH ROI**: P2 demonstrates a real provider adapter, bounded context, structured output validation, retries, citation filtering, and a verified live text-generation request. Do not claim model tool-calling support, production readiness, prompt-injection immunity, or hallucination-free answers.
