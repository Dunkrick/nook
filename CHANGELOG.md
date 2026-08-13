# Changelog

All notable changes to Nook are documented in this file.

The project follows Semantic Versioning.

---

## v1.1.0

### Added

#### Infrastructure
- Containerized backend using Docker.
- Production deployment to Google Cloud Run.
- Google Artifact Registry for Docker image management.
- Health check endpoint for production verification.

#### Development Experience
- Repository restructured into independent `frontend/` and `backend/` applications.
- Root workspace orchestrator for local development.
- Cloud deployment documentation.

#### Product
- Spatial wall-first interaction model.
- Draft cards created directly on the canvas.
- Optimistic drag persistence.
- Multi-selection toolbar.
- Insight panel foundation.

---

### Changed

#### Backend
- Migrated deployment from Render to Google Cloud Run.
- Standardized production environment configuration.
- Improved Docker compatibility for Apple Silicon (amd64 builds).

#### Frontend
- Refined wall-first interaction.
- Improved drag responsiveness.
- Improved optimistic UI updates.
- Semantic design token system.
- Initial workspace redesign.

---

### Infrastructure

- Google Cloud Run
- Google Artifact Registry
- Docker
- Neon PostgreSQL
- Prisma ORM

---

## v1.0.0

### Added

#### Frontend
- React + Vite application.
- Protected routes.
- Authentication flow.
- Wall interaction model.
- Spatial card rendering.
- Drag-and-drop cards.
- Inline editing.
- Draft card workflow.

#### Backend
- Express API.
- TypeScript.
- Prisma ORM.
- PostgreSQL persistence.
- JWT Authentication.
- Validation middleware.
- Global error handling.

#### Design System
- Semantic design tokens.
- Brand color system.
- Motion tokens.
- Elevation tokens.
- Typography scale.
- Block-based card components.

---

### Infrastructure

- Neon PostgreSQL
- Prisma ORM
- TypeScript