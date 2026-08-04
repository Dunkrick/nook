# ADR-001: Wall-first interaction model

## Status

Accepted (implemented)

## Context

The wall is a spatial canvas where position carries meaning (see `0005-wall-coordinates.md`). Card creation was originally driven by a hero input form above the wall, an explicit "type into reality" affordance that had no relationship to where the card would live on the wall.

The product thesis ("Creation over Configuration", "Interaction over Interface") favours low-friction, spatial, in-place creation. For the wall to feel native, creating a card should happen on the wall itself, at the spot where the user wants it, rather than through a disconnected form.

## Decision

The wall surface is the primary creation surface. Double-clicking anywhere on an empty area of the wall invokes the `onCreate` callback with the pointer's coordinates (`Wall.tsx:27-42`), which opens a draft card at that exact location (`Home.tsx:16-22`).

The legacy hero input is retained for parity during the transition but is explicitly marked for removal once wall-first creation is complete (`Home.tsx:14`):

```ts
// TODO(v5): Remove hero input once wall-first creation is complete.
```

## Consequences

Positive:

- Creation is spatial: a card is born where it belongs, not dumped at a grid origin.
- Alignment with the product thesis (interaction over interface, creation over configuration).
- The empty area double-click is cheap and requires no buttons, menus, or toolbar.

Negative:

- Two creation paths coexist (hero form + double-click), which is a temporary inconsistency.
- Double-click only triggers on empty wall area, so it requires hitting space between/outside cards.
- Discovery relies on the user trying a double-click; there is no visible affordance for it.

## Alternatives considered

- **Hero input only** — rejected. It disconnects creation from position, forcing cards onto a computed grid instead of where the user clicked.
- **Toolbar / "new card" button** — rejected. Adds a click and a separate mental step; less spatial, more configuration.
- **Click-to-place then type** — considered. Rejected in favour of double-click to avoid firing a draft whenever the user clicks to select, drag, or deselect.

## Trade-offs

- We trade discoverability for spatial immediacy; a new user may not know to double-click.
- We deliberately keep a small amount of short-lived duplication (the hero form) rather than remove it prematurely while users may still depend on it.