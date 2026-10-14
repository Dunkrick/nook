# AGENTS.md: rules for AI coding agents working on Nook

Read this before every task. If a brief conflicts with this file, stop and ask.

## Project

Nook is a spatial thinking canvas. Frontend: React 19, Vite, TypeScript, plain CSS with design tokens (no Tailwind, no UI library). Backend: Node, Express, Prisma, PostgreSQL. Artifact types: TEXT, LINK, POLAROID, GITHUB_ISSUE.

## How we work

- One packet = one branch named `redesign/<packet-id>`. Never commit to main.
- Targeted patches. Touch only the files named in the brief. No wholesale rewrites, no drive-by refactors, no renames.
- Before coding, post a plan of at most 8 lines. In the PR description, list each decision and the reason for it.
- If the brief and the code disagree, or context is missing, stop and ask. Do not guess.
- No new dependencies without asking.
- Run before finishing and paste the results.
  - Frontend: `npm run lint`, `npm run build`, `npm test -- --run`
  - Backend: `npm run typecheck`, `npm test`

## Design rules (v2)

1. **Tokens only.** Component CSS never contains raw hex, raw radius, raw shadow, or raw font family. Add the token first, then use it. Check: `grep -rnE "#[0-9a-fA-F]{3,8}\b" src/assets/styles --include=*.css | grep -v "/tokens/"` must return nothing.
2. **Shape.** Things you handle (cards, buttons, inputs, panels) are square: `--radius-0`. Only the polaroid uses `--radius-paper`. Pills are for small status tags only.
3. **Depth.** UI cards have an ink border and no shadow at rest. Lift and drag use the hard offset shadow token. The polaroid uses the paper shadow tokens.
4. **Type.** Four voices only: serif for thoughts and display, sans for UI, mono for metadata, handwriting for polaroid captions. No other fonts.
5. **Color has a job.** Color marks state (open, closed, selected, fresh) or paper stock by type. No decorative gradients. Never pick a color from an id.
6. **Motion answers an action or shows a state.** Tokens only. Every animation has a reduced-motion fallback. No hover scale on cards. At most one ambient motion per screen.
7. **Accessibility floor.** Visible focus on every interactive element. Text contrast at least 4.5:1 (3:1 for large text). State is never shown by color alone. Everything works with a keyboard.
8. **Copy.** Sentence case, plain verbs. Errors say what happened and what to do, and they do not apologize. One action keeps one name across the whole flow.
9. **Marks must be human or functional.** Users make handwriting, captions, and stamps. The system makes state marks, such as a lit dot. Never add decorative doodles or fake hand-drawn elements.
10. **No name-dropping.** Never mention any TV show or film by name in the UI, code, comments, or commit messages. Design by principle only.

## Backend rules

- Preserve ownership checks on every artifact read and write.
- Artifact `content` is type-specific JSON. Do not add Prisma migrations unless the brief says so.
- Add or update tests for every behavior change.
