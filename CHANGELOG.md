# Changelog

All notable changes to Nook are documented in this file.

The project follows Semantic Versioning.

---

## Unreleased

### Added

#### Authentication

- User registration and login flows.
- JWT-based authenticated sessions.
- Protected frontend routes.
- Private user workspaces.
- Password visibility control integrated directly into the password input.

#### Workspace

- Artifact-based workspace model.
- Support for text and link artifacts.
- Workspace-level editing coordination.
- Explicit editing ownership through `editingArtifactId`.
- Editing state propagation from artifacts through the workspace.
- Prevention of conflicting drag and edit interactions.

#### Interaction

- Improved artifact interaction composition.
- Dedicated artifact interaction orchestration hook.
- Editing and dragging composed from focused interaction hooks.
- Multi-selection interaction support.
- Selection toolbar integration.

#### Architecture

- Clear separation between:
  - artifact presentation
  - artifact interaction orchestration
  - editing behavior
  - dragging behavior
- Workspace-level coordination for mutually exclusive editing interactions.

---

### Changed

#### Frontend

- Evolved terminology from card-centric interactions toward artifact-centric interactions.
- Refined interaction ownership between `Home`, `Wall`, and `Artifact`.
- Improved password input UX with an inline visibility control.
- Improved interaction consistency between editing and dragging.

#### Documentation

- Updated README to reflect the current workspace architecture.
- Updated roadmap to reflect the current frontend and user phase.
- Updated architecture documentation with artifact interaction ownership.

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
- Improved Docker compatibility for Apple Silicon.

#### Frontend

- Refined wall-first interaction.
- Improved drag responsiveness.
- Improved optimistic UI updates.
- Semantic design token system.
- Initial workspace redesign.

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
