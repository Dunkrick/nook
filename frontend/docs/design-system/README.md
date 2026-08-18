# Nook Design System — DS-1

DS-1 freezes the visual laws of Nook before feature expansion. The product is a personal thinking desk: calm by default, playful when invited, and never noisy or corporate.

## System map

- [Brand](./01-brand.md) — personality and voice
- [Typography](./02-typography.md) — semantic text roles
- [Logo](./03-logo.md) — one mark family
- [Materials](./04-materials.md) — canvas through overlay
- [Workspace](./05-workspace.md) — the infinite desk
- [Motion](./06-motion.md) — movement with purpose
- [Components](./07-components.md) — current implementation contracts

## Code map

`src/assets/styles/index.css` is the sole global entry point. Its folders mirror this system: `foundation/` defines roles, `workspace/` styles the desk and its furniture, and `artifacts/` styles thoughts and empty-state notes. Use semantic tokens from `foundation/tokens.css`; do not introduce raw colors in component CSS.
