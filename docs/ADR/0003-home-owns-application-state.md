# ADR-003: Home owns application state

## Status

Accepted (implemented)

## Context

The wall page needs several pieces of mutable state to coordinate its UI: the list of persisted cards, the draft-in-progress, and the hero input text. Multiple components consume this data (`Wall`, `Card`, `DraftCard`). For the components to stay presentational and reusable, the state and the data mutations need a single, centralized owner.

## Decision

The `Home` page component owns all application state and all data-loading and mutation logic (`Home.tsx:11-13`):

```ts
const [cards, setCards] = useState<Card[]>([]);
const [draftCard, setDraftCard] = useState<DraftCard | null>(null);
const [newCardText, setNewCardText] = useState("");
```

`Home` also implements every data handler (`handleCreateDraft`, `handleCommitDraft`, `handleCancelDraft`, `handleAddCard`, `handleUpdateCard`, `handleDeleteCard`) and fetches initial cards on mount (`Home.tsx:41-47`). It passes data and callbacks down as props; child components (`Wall`, `Card`, `DraftCard`) are controlled and have no independent data layer.

## Consequences

Positive:

- A single source of truth for page state.
- Components below `Home` are presentational, reusable, and trivially testable with injected props.
- All API calls and state transitions are centralized and easy to audit in one file.

Negative:

- `Home` grows as page state scales (it currently mixes header, hero form, draft, and card CRUD).
- Deep components receive data via prop drilling rather than direct access.

## Alternatives considered

- **Wall owns the state** — rejected. The hero input and initial fetch also live at the page level, and `Wall` is meant to stay a presentational composition component (ADR-004); giving it state would blur that boundary.
- **A global store (Context / Redux)** — rejected. Overkill for the current scale; adds indirection with no shared cross-route state today.

## Trade-offs

- We prefer explicit prop drilling over premature global state; state stays close to its consumer tree.
- The trade-off is that a single page component bears the growth cost as features accumulate.