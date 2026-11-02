# Nook Frontend

This is the React frontend for Nook, built with Vite and TypeScript.

## Quick Start

```bash
npm install
cp .env.example .env
npm run dev
```

## Styling

The application relies on plain CSS and semantic design tokens defined in `src/assets/styles/tokens/tokens.css` (no Tailwind, no external UI library). Component CSS uses CSS custom properties exclusively for color, typography, shape, and motion.

Key design principles (v2):
- **Tokens only**: No raw hex, raw radius, raw shadow, or raw font families in component CSS.
- **Square shape**: Cards, buttons, inputs, and controls use `--radius-0`. Only Polaroid frames use `--radius-paper`.
- **Typographic voices**: Serif (`EB Garamond`) for thoughts and display, sans (`Plus Jakarta Sans`) for UI, mono (`IBM Plex Mono`) for metadata, and handwriting (`Caveat`) for polaroid captions.
- **Tactile depth**: UI cards carry an ink border, lifting with offset shadows on hover and drag, and playing a subtle physical settle on drop.
- **Color has a job**: Paper stocks identify artifact type (`--stock-text`, `--stock-link`, `--stock-photo`, `--stock-issue`) or user-chosen tint overrides (`--tint-*`). Color is never picked from an ID.

## Architecture

- `src/pages`: Page-level route components.
- `src/components`: Reusable UI elements (e.g., `AuthForm`).
- `src/services`: API handlers bridging the React UI and Express backend.
- `src/lib`: Core utilities (e.g., `storage.ts` for JWT).
