# Changelog

All notable changes to Nook will be documented in this file.

## v3.1.0

BREAKING CHANGE

The wall is now the primary interaction surface.

Card creation no longer depends on a separate input form.
Users create thoughts directly inside the wall through transient draft cards.

### Added
- **Wall-First Interaction**: Added mouse double-click coordinate listener on the canvas (`Wall.tsx`) to map note placements dynamically.
- **Transient Draft Notes**: Created `DraftCardComponent` rendering an inline absolute-positioned textarea.
- **Save/Cancel Hotkeys**: Integrated keyboard actions (pressing `Enter` to submit, `Escape` to cancel/discard drafts).

### Changed
- **Component Separation**: Extracted `DraftCardComponent` into its own source file, decoupling creation concerns from `CardComponent`.
- **Interaction Rules**: Implemented `e.stopPropagation()` on double clicks within cards and buttons, blocking nested draft note instantiation.

### Removed
- **Unused Props**: Retired the unused `startEditing` parameter from the persisted card rendering configurations.

---

## v3.0.0

### Added

**Frontend (React + Vite)**
- Bootstrapped frontend using React, TypeScript, and Vite.
- Implemented client-side routing via `react-router-dom`.
- Created robust Network Service (`api.ts`) to centralize standard HTTP fetch requests.
- Integrated `localStorage` manager for handling JWT tokens across browser sessions.
- Added Protected Route middleware component to guard authenticated views.

**Branding & UI**
- Adopted strict CSS Design Tokens (`dreamwall-tokens.css`).
- Designed a Block-card system featuring thick 2px charcoal borders and 24px rounded corners.
- Created dynamic 4-color block cycling (Sunset Coral, Golden Glow, Twilight Blue, Momentum Green).

**Complete CRUD Work**
- **Create**: Added a "Create Dream" Hero Block utilizing POST endpoints.
- **Read**: Fetching and rendering user-specific dreams automatically on Home mount.
- **Update**: Built inline Edit-mode toggles on cards utilizing PATCH endpoints.
- **Delete**: Implemented optimistic UI deletion mapping to DELETE endpoints.

**Authentication**
- User registration and Login controllers.
- JWT storage and authorization headers injection.
- Reusable `<AuthForm />` component.

---

## v2.5.0

### Added
- Prisma ORM
- Validation middleware
- Global error middleware

### Changed
- Migrated JavaScript to TypeScript
- Replaced raw SQL with Prisma

### Removed
- Raw PostgreSQL client
- Duplicate validation logic