# ADR-0011: Workspace owns active editing state

## Status

Accepted (implemented)

## Context

Artifacts support inline editing.

Editing is locally implemented through `useArtifactEditing`, which manages:

- edit text
- input focus
- save
- cancel
- keyboard behavior

However, whether an artifact is the currently active editing artifact affects the workspace as a whole.

Without centralized coordination, multiple artifacts could enter editing mode simultaneously or workspace interactions could conflict with editing.

The workspace therefore needs a single owner for the identity of the active editing artifact.

---

## Decision

`Home` owns the identifier of the currently editing artifact.

```ts
const [editingArtifactId, setEditingArtifactId] = useState<number | null>(null);
```
