# ADR-004: Wall owns composition

## Status

Accepted (implemented)

## Context

The wall has a distinct rendering job that is separate from data and state: laying out persisted cards, rendering the in-progress draft, showing an empty state, converting pointer coordinates into wall coordinates, applying entry animation delays and per-card rotation, and giving every card an absolute position.

These responsibilities are purely compositional and presentational, yet they are cohesive — they all describe "how the wall looks and behaves as a surface".

## Decision

`Wall` is a presentational component that owns the composition of the wall surface. It receives `cards` and `draftCard` as props plus creation/update/delete/commit/cancel callbacks, and owns:

- mapping `cards` to `Card` components with absolute `left`/`top` positioning, staggered animation delays, and per-index rotation (`Wall.tsx:80-95`),
- rendering `DraftCard` when a draft exists (`Wall.tsx:96-105`),
- the empty state when there are neither cards nor a draft (`Wall.tsx:44-76`),
- converting a double-click's `clientX/clientY` into wall-relative coordinates for creation (`Wall.tsx:27-35`).

State and data logic remain in `Home` (ADR-003); `Wall` is controlled by props.

## Consequences

Positive:

- `Home` stays thin and free of layout details.
- Layout and composition logic is co-located in the component that renders it.
- The visual surface can be restyled or re-composed without touching data logic.

Negative:

- `Wall` carries presentation-specific concerns (rotation values, animation timing) that are currently hard-coded inline.
- Pointer-to-coordinate conversion lives in the component rather than a shared geometry helper.

## Alternatives considered

- **`Home` composes everything inline** — rejected. It would bloat the page with layout concerns that ADR-003 deliberately keeps out of it.
- **A dedicated layout/geometry helper module** — rejected. Over-engineering for a fixed-size wall with a single layout; the conversion is two lines.

## Trade-offs

- We concentrate all wall rendering in one component, accepting that it grows as the wall's visuals grow.
- Inline presentation details (rotation, animation) are a deliberate convenience over early abstraction.