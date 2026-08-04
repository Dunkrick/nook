# ADR-002: Dedicated DraftCard component

## Status

Accepted (implemented)

## Context

A card that is being drafted on the wall behaves differently from a persisted card. While composing, a card needs:

- a `<textarea>` that auto-focuses on mount,
- `Enter` to commit, `Shift+Enter` for a newline, `Escape` to cancel (`DraftCard.tsx:23-44`),
- to stop double-click propagation so it does not spawn another draft,
- no edit/delete buttons, no drag behaviour, no persistence,
- no identity (no `id`, `userId`, `createdAt`, `updatedAt`).

Folding this behaviour into the existing `Card` component would force it to branch on whether it is a draft or a persisted card.

## Decision

A dedicated `DraftCard` component (`nook-frontend/src/components/DraftCard.tsx`) renders the draft. It owns its local text state and keyboard interactions, and receives only a `Position` plus `onCommit`/`onCancel` callbacks. It is rendered by `Wall` whenever a `draftCard` is present (`Wall.tsx:96-105`).

## Consequences

Positive:

- `Card` (`Card.tsx`) stays focused solely on persisted cards: editing, drag-and-drop, delete.
- Draft behaviour (focus, commit, cancel) is isolated and independently testable.
- Clear feature boundary: presentation of "drafting" vs. presentation of "persisted card".

Negative:

- An additional component and prop surface to understand.
- Some presentational styling (sizing, radius, shadow) is duplicated by hand between `Card` and `DraftCard` rather than shared.

## Alternatives considered

- **Render drafts inside `Card` via an `isDraft` prop** — rejected. Pollutes `Card` with branching and drag/edit/delete logic that is meaningless for an unsaved draft.
- **Reuse `Card` and hide the extra affordances** — rejected. `Card` operates on a persisted `Card` (it requires an `id` to update/delete); drafts have no identity and would require fake values.

## Trade-offs

- We accept a little duplicated styling in exchange for keeping each component single-purpose.
- A new abstraction (the component) is preferred over conditional logic spreading through the existing card.