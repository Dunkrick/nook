# DreamWall Frontend

This is the React frontend for DreamWall, built with Vite and TypeScript.

## Quick Start

```bash
npm install
cp .env.example .env
npm run dev
```

## Styling
The application relies on a structural design system using CSS tokens from `src/assets/dreamwall-tokens.css`. All styling adheres strictly to the brand guidelines (sentence-case logo, structured block elements with 2px charcoal borders, and 24px rounded corners).

## Architecture
- `src/pages`: Page-level route components.
- `src/components`: Reusable UI elements (e.g., `AuthForm`).
- `src/services`: API handlers bridging the React UI and Express backend.
- `src/lib`: Core utilities (e.g., `storage.ts` for JWT).
