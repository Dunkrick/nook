## Card Interaction Refactor

### Why

The Card component had accumulated multiple responsibilities:

- Rendering
- Dragging
- Editing
- Selection

This made the component harder to extend and reason about.

### Decision

Extract an orchestration hook (`useCardInteraction`) that composes editing, dragging, and selection behavior.

Move rendering into `CardView`.

### Result

- Smaller container component
- Clear separation between behavior and presentation
- Easier to introduce future interactions (AI suggestions, collaboration, relationships) without increasing component complexity

## 2026-08-19

### Card Stylesheet

Changes

- Normalized stylesheet organization.
- Removed duplicated selectors.
- Introduced semantic interaction tokens.
- Preserved rotation during hover and drag.
- Replaced magic spacing with design tokens.

Why

The stylesheet became easier to navigate and established a standard for future component stylesheets.