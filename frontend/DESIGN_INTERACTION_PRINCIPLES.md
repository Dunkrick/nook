# Nook interaction principles

Nook should feel like a personal wall that rewards curiosity, not a generic dashboard pretending to be creative.

## The rules

1. **Spatial memory is sacred.** An artifact keeps its world position across panning and zooming. Pointer input is always translated through the camera before it changes the world.
2. **Imperfection has a job.** Uneven radii, imperfect outlines, tiny rotations, and tactile shadows identify things made by a person. They never obscure text, controls, or focus.
3. **Motion explains cause and effect.** Lift indicates a draggable object, a stronger shadow means it is in the hand, and a dashed outline means selection. Motion does not run merely to decorate idle space.
4. **The canvas remains calm.** The toolbar and overlays are quiet floating tools; the artifacts own the colour and personality.
5. **States need different signatures.** Hover, focus, drag, edit, selection, draft, and creation each have a visible distinction that does not depend on colour alone.

## Interaction contract

- Double-click the canvas to choose an artifact type at the exact world location.
- Hold Space and drag, or use middle-click drag, to pan.
- Scroll to zoom toward the pointer; zoom remains between 60% and 160%.
- Press Escape to cancel a draft or a pending artifact type choice.
- Text artifacts can be edited; links are intentionally view-only until the API supports link updates.

## Review checklist

- Does the interaction preserve the user’s spatial relationship with their artifacts?
- Does an imperfect detail clarify material or personality?
- Does every animated change correspond to a user action or a state transition?
- Is the state understandable with keyboard focus and without colour perception?
- Would removing this decoration make the action less clear? If not, remove it.
