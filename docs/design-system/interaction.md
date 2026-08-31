# Interaction States

Interactive objects inside Nook transition through a shared set of interaction states.

The goal is to make interaction behavior predictable across the workspace.

---

## States

### Idle

The artifact is visible but not actively interacted with.

### Hovered

The pointer is over the artifact.

Hover may reveal subtle affordances but should not create visual noise.

### Selected

The artifact is part of the current selection.

Multiple artifacts may be selected simultaneously.

### Dragging

The artifact is actively being repositioned.

Dragging updates the visual position immediately and persists the final position optimistically.

### Editing

The artifact is being edited.

While editing:

- text input receives focus
- drag interaction is disabled
- editing ownership is coordinated at the workspace level

Only one artifact should be actively edited at a time.

### Draft

The artifact exists locally but has not yet been persisted.

Draft artifacts allow users to begin creation directly inside the workspace.

### Disabled

The object cannot currently accept interaction.

Examples include loading states or controls temporarily unavailable during mutations.

---

# Interaction Ownership

Interaction state exists at different levels depending on its scope.

## Local Artifact State

Artifact-local hooks manage focused behavior such as:

- edit text
- input references
- drag pointer state

## Workspace State

The workspace coordinates interactions that must remain globally consistent.

Examples:

- currently editing artifact
- artifact selection

This prevents conflicting interactions across artifacts.

---

# Interaction Rules

## Editing and Dragging

An artifact should not begin dragging while it is being edited.

Editing takes priority over dragging.

## Editing Ownership

Only one artifact should be actively edited at a time.

Starting a new editing interaction should update workspace ownership accordingly.

## Selection

Selection is explicit.

Modifier-assisted selection can add or remove artifacts from the active selection.

## Persistence

Interactions should feel immediate.

Where safe:

1. Update the local UI.
2. Persist asynchronously.
3. Reconcile errors when necessary.

---

# Design Principle

> Components should not invent interaction models independently.

Shared interaction rules should remain consistent across the workspace.
