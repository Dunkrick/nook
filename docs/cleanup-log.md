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