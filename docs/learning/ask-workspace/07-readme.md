# Ask your workspace — P7 README and honest claims

## What we built

We added an Ask your workspace section to the repository README. It explains the request path, API route, and current product limits. It also says Ask is built, while authenticated production answer generation is not verified.

## Why it exists

Without this section, a recruiter or engineer opening the repository could miss the feature or assume it is a general chatbot. The documented limits keep the project description tied to behavior that exists in code. The production status stays honest because a responding API health check and an unauthenticated 401 do not prove a configured key or working authenticated answer request.

## New AI concept(s) in plain English

- **Grounded answer** means an answer created from evidence selected by our code. For example, when Rithwick asks whether staging deployed, backend selects a Nook deployment note, sends its text to Gemini, and permits only retrieved artifact ids as citations.
- **Tool path** means the optional path where a model asks our backend to run a named function. Ask's `search_workspace` function receives filters only; backend supplies the authenticated user and workspace ids.
- **Evaluation fixture** means a fixed sample question plus expected checks. P6 uses ten fixtures with hand-written evidence such as a synthetic deployment note. Its generation checks use the single-shot prompt; it does not call real workspace retrieval or the tool path.
- **Resume-safe claim** means a short project statement that code and available verification support. “Built an authenticated workspace question endpoint with keyword retrieval and evidence id checks” is supported. “Live production AI assistant” is not verified.

## Files touched

| file | what changed | why |
|---|---|---|
| `README.md` | Added Ask capability, route, architecture flow, limits, evaluation scope, and resume-safe status | Make shipped work visible without overstating it |
| `docs/learning/ask-workspace/07-readme.md` | Added this packet record | Explain what the README claims and why |
| `docs/learning/ask-workspace/GLOSSARY.md` | Added terms introduced in this packet | Keep AI vocabulary explainable |
| `docs/learning/ask-workspace/DECISIONS.md` | Recorded claim wording and limits | Preserve alternatives and trade-offs |
| `docs/learning/ask-workspace/LOG.md` | Recorded P7 and reliability follow-up | Keep dated work history |

## Line-by-line walkthrough of the 2-3 most important functions

P7 changes documentation, so it adds no runtime functions. This request flow from the README describes the existing feature:

```text
Question → authenticate + ownership check → keyword retrieval and ranking
  → selected evidence → Gemini structured answer → validate + ground citations
  → answer, key points, evidence, unresolved open issues
```

- `Question`: user submits one bounded question to the existing workspace route.
- `authenticate + ownership check`: backend gets identity from the session, then checks workspace belongs to that user.
- `keyword retrieval and ranking`: plain TypeScript filters and scores stored artifacts; model does not query PostgreSQL.
- `selected evidence`: backend sends only retrieved artifact text, with a maximum of eight hits.
- `Gemini structured answer`: provider returns the expected JSON shape.
- `validate + ground citations`: backend parses the shape and drops citations whose numeric artifact id was not retrieved.
- Final fields include open GitHub issues that backend marks unresolved; model does not fill that field.

## How to run/test it yourself

- Open `README.md` at repository root. Expected: “Ask your workspace” appears in capabilities, API, architecture, limits, and status sections.
- `cd backend && npm run typecheck` — expected: TypeScript completes without errors.
- `cd backend && npm test` — expected: all backend Vitest tests pass, including retry, route status, and eval result tests.
- `cd backend && npm run eval:ai` — makes live requests for eight synthetic evidence-backed fixtures and skips two fixed no-evidence fixtures. Provider errors appear as `ERROR`, separate from behavior `FAIL`.

## How it can go wrong

1. **README implies selected-card-only answers:** UI opens Ask after card selection, but endpoint searches workspace. README states that scope directly.
2. **Evaluation sounds like retrieval proof:** P6 supplies hand-written fixture evidence and uses single-shot generation; README calls out both limits.
3. **Reachable API is described as working Ask generation:** production `/health` returns 200 and unauthenticated Ask returns 401, but authenticated generation/key availability remain unverified. README says “built” and leaves “live” unclaimed.

## Interview questions

1. **How does Ask keep Gemini away from the database?** — “Our backend authenticates and checks ownership, retrieves matching artifacts, then sends only their text to Gemini. Gemini never gets database credentials or a database tool.”
2. **What does the ten-case evaluation prove?** — “Only selected formatting and citation properties for synthetic evidence. It does not test real retrieval, tool calling, or production answer accuracy.”
3. **Can you call Ask live?** — “I can say it is built. The public route is present, but I have not verified authenticated generation or the production Gemini key.”

## Rating: HIGH / MEDIUM / LOW ROI for Elip, and what I must NOT claim on my resume yet

**HIGH ROI** for project communication: a reviewer can find the feature and see concrete limits quickly. I must not claim production availability, semantic search, vector retrieval, or a retrieval-and-tool-path evaluation; those are not verified here.
