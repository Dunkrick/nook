# ADR-005: Draft state separated from persisted cards

## Status

Accepted (implemented)

## Context

While a user is composing a card on the wall, that card does not yet exist in the backend. A draft has no identity: no `id`, `userId`, `createdAt`, or `updatedAt`. If drafts were represented as `Card` objects they would need fabricated identities, risk colliding with real card keys in the rendered list, and could be accidentally sent to the API as if they were persisted.

## Decision

The draft is modelled as a distinct type, separate from the persisted card:

- `Card` keeps the persisted shape: `id`, `text`, `userId`, `x`, `y`, `createdAt`, `updatedAt` (`types/cards.ts:1-9`).
- `DraftCard` contains only the composition-relevant fields: `text`, `x`, `y` (`types/cards.ts:11-15`).

`Home` holds `draftCard` in its own state variable, never merged into the `cards` array (`Home.tsx:11-12`). Persistence is explicit and one-way: committing a draft calls `createCard` and appends the returned persisted card to `cards`, then clears the draft (`Home.tsx:24-35`).

## Consequences

Positive:

- No placeholder identities; `cards` always contains only persisted cards.
- React list keys and position updates never touch a transient draft.
- The commit path is explicit: a draft can only become a card through an API call.

Negative:

- Two parallel state fields (`cards` + `draftCard`) must be kept in sync by `Wall` when rendering.
- A small duplication of type surface: `DraftCard` mirrors `Card` minus the identity fields.

## Alternatives considered

- **Draft as a `Card` with a temporary/negative id** — rejected. Risks key collisions, accidental API calls, and confusion about what is persisted.
- **A single array with a `status` field on each item** — rejected. Mixes transient and persisted data, complicates update/delete flows, and obscures the persistence boundary.

## Trade-offs

- We accept a modest amount of type duplication and dual state fields to gain a strong invariant: persisted cards and in-progress drafts are never conflated.