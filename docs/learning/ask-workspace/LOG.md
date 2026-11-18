# Ask your workspace work log

- 2026-11-18 — P0: read `AGENTS.md`, ADR format, schema, routes, auth, ownership helper, mapper, and package scripts; verified most supplied repo facts.
- 2026-11-18 — P0: confirmed current branch was `redesign/aws-migration`; initial branch creation hit read-only Git metadata sandbox, then required `feat/ask-p0-recon` branch was created after escalation approval.
- 2026-11-18 — P0: found Gemini model name absent; stop before P2 and ask owner. `API_KEY` value not checked or printed.
- 2026-11-18 — P0: found pre-existing untracked `backend/global-bundle.pem` from prior RDS setup; outside P0 scope, left untouched.
- 2026-11-18 — P0: `npm run typecheck` passed; sandboxed `npm test` hit localhost bind `EPERM`, then approved rerun passed 15 files / 89 tests.
- 2026-11-18 — P1: wrote retrieval tests first for extraction, term ranking, recency, time/type/open filters, temporal-only query, and unowned workspace.
- 2026-11-18 — P1: implemented `rankArtifacts` as pure scoring function; `searchWorkspace` uses existing ownership helper and mapper.
- 2026-11-18 — P1: `npm run typecheck` passed; `npm test` passed 16 files / 99 tests. No P1 implementation dead ends or test failures.
- 2026-11-18 — P2: owner supplied `Gemini-4-Hydrogen`; public Google model docs did not verify exact string. Checked `API_KEY` presence only; secret stayed hidden.
- 2026-11-18 — P2: installed authorized `@google/genai` SDK; npm sandbox install stalled, approved network retry succeeded. npm install reported 19 audit findings (1 low, 4 moderate, 13 high, 1 critical); no audit fix or unrelated dependency change run.
- 2026-11-18 — P2: first service test run exposed incomplete workspace-search mock; changed it to partial mock so prompt can use real text extraction. Typecheck and tests then passed.
- 2026-11-18 — P2: `npm run typecheck` passed; `npm test` passed 17 files / 111 tests, all using fake LLM and no network.
