# Changelog

All notable changes to Nook are documented in this file.

The project follows Semantic Versioning.

---

## v1.3.0

### Added

#### Tactile artifact personalization and material stocks
- Added type-specific material stocks mapping artifact types to distinct paper stock tokens (`--stock-text`, `--stock-link`, `--stock-photo`, `--stock-issue`).
- Replaced deterministic ID-based color assignment with semantic material identities.
- Added distinct typographic voices: `--font-serif` (`EB Garamond`) for TEXT thoughts, `--font-mono` for metadata/indices, and Caveat handwriting for polaroid captions.
- Added tactile drop settle animation (`@keyframes nook-artifact-settle`) with shadow dampening on card landing.
- Added user-customizable paper tint palette (`cream`, `rose`, `sky`, `sage`, `lavender`, `butter`).
- Added accessible square swatch `TintPicker` component (`role="radiogroup"`, `role="radio"`, `aria-checked`, focus rings).
- Added `tint String?` column to the `Artifact` database model with migration `20261102120000_add_artifact_tint`.
- Added backend tint whitelist validation, update persistence, and unit test suites.

#### OAuth 2.0 authentication
- Added Google and GitHub OAuth 2.0 sign-in flows with automatic identity linking and reconciliation.
- Added `OAuthAccount` database model linking external identity providers to user accounts.
- Added `GET /auth/google`, `GET /auth/google/callback`, `GET /auth/github`, and `GET /auth/github/callback`.
- Added frontend OAuth buttons and auth callback route.
- Made user `passwordHash` optional to support pure OAuth users.

#### GitHub issue integration
- Added `GITHUB_ISSUE` artifacts as a first-class spatial artifact type.
- Added webhook ingress at `POST /webhooks/github` with HMAC-SHA256 signature verification.
- Added asynchronous RabbitMQ pipeline with publisher confirms, prefetch control, and reconnection handling.
- Added background worker runtime (`github-worker.ts`) consuming issues and syncing state transitions (`opened`, `edited`, `closed`, `reopened`).
- Added dead-letter queue (DLQ) routing after bounded retries for transient failures.
- Added transactional persistence and webhook delivery idempotency tracking.

#### Polaroid captions
- Added optional caption support (`caption?`) on `POLAROID` artifacts stored in artifact JSON.
- Added caption input in polaroid draft creation and inline double-click caption editing on the wall.
- Added single-line enforcement and a 48-character limit.

---

## v1.2.0

### Added

#### Polaroid artifacts and private media

- Added `POLAROID` artifacts backed by an `imageKey` stored in artifact JSON.
- Added authenticated `POST /uploads` multipart upload flow.
- Added image validation for JPEG, PNG, and WebP files.
- Added a 10 MB image upload limit.
- Added private Google Cloud Storage integration.
- Added per-user object keys under `uploads/users/{userId}/...`.
- Added short-lived signed read URLs for private Polaroid images.
- Added authenticated `GET /artifacts/:id/image`.
- Added Polaroid rendering that fetches the signed URL through the authenticated API before rendering the image.

#### Authentication and workspaces

- Added user registration and login flows.
- Added JWT-based authentication.
- Added protected workspace and artifact operations.
- Added workspace ownership checks.
- Added artifact ownership checks.
- Added workspace-scoped artifact CRUD operations.

#### Artifact model

- Replaced the older card-oriented domain terminology with `Artifact`.
- Added artifact types:
  - `TEXT`
  - `LINK`
  - `POLAROID`
- Added flexible JSON content for type-specific artifact data.
- Kept spatial coordinates (`x`, `y`) and `zIndex` as first-class persisted fields.

#### Storage architecture

- Added the `ObjectStorage` interface.
- Added Google Cloud Storage as the current storage implementation.
- Separated binary media storage from PostgreSQL artifact records.

#### Testing and deployment

- Added backend unit tests with Vitest.
- Added frontend component tests with Vitest.
- Added backend test execution to CI.
- Added backend type checking to CI.
- Added backend production build verification to CI.
- Added Docker image build verification to CI.
- Added Cloud Run deployment through GitHub Actions.
- Added `/health` deployment verification.

---

### Changed

#### Image delivery

The Polaroid image endpoint no longer redirects the browser directly to a signed Google Cloud Storage URL.

Previous flow:

```text
Browser
  ↓
GET /artifacts/:id/image
  ↓ 302
Google Cloud Storage
```

Current flow:

```text
Browser
  ↓ authenticated API request
GET /artifacts/:id/image
  ↓ 200 { url }
Browser
  ↓
signed GCS URL
  ↓
private image
```

This keeps authorization at the Nook API boundary and avoids the browser behavior associated with an authenticated request following a cross-origin redirect.

#### Upload architecture

The media upload flow is now server-mediated:

```text
Browser
  ↓ multipart/form-data
POST /uploads
  ↓
Express + Multer
  ↓
ObjectStorage
  ↓
Google Cloud Storage
```

The previous documentation describing `POST /uploads/sign` and direct browser `PUT` uploads is obsolete.

#### Domain terminology

- Evolved from card-centric terminology toward artifact-centric terminology.
- Workspace interactions now operate on artifacts.
- Media references are represented by `imageKey` rather than public image URLs.

#### Backend structure

- Business logic is separated into services.
- Routes focus on HTTP concerns.
- Storage is accessed through an explicit abstraction.
- Artifact records are mapped into domain objects before being returned by services.

---

## v1.1.0

### Added

#### Infrastructure

- Containerized backend using Docker.
- Production deployment to Google Cloud Run.
- Google Artifact Registry for container images.
- Health check endpoint for production verification.
- Cloud deployment documentation.

#### Product

- Spatial wall-first interaction model.
- Draft artifacts created directly on the canvas.
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
- Added semantic design tokens.
- Continued workspace redesign.

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
- JWT authentication.
- Validation middleware.
- Global error handling.

#### Design system

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
