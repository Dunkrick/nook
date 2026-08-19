# ADR-0010: Frontend Design System Architecture

## Status

Accepted

## Context

Nook is a wall-first thinking space. As the frontend grows, styling decisions must remain consistent across cards, workspace surfaces, toolbars and future AI interactions.

Previously, styling was centralized in a few large CSS files with duplicated values and component-specific interaction rules.

This made evolution difficult.

## Decision

The frontend styling is organized into semantic layers.
- styles/
- foundations/
- primitives/
- workspace/
- artifacts/


Interaction behavior is extracted into reusable interaction tokens.

Components consume design tokens instead of hardcoded values whenever possible.

## Consequences

Positive

- Consistent interaction language.
- Easier maintenance.
- Easier onboarding.
- Easier theme support.

Negative

- Slightly more upfront structure.
- Requires discipline when introducing new components.

## Future

Interaction tokens will expand to support:

- AI suggestions
- Panels
- Connections
- Selection rectangles
- Zoom interactions