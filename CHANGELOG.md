# Changelog

All notable changes to Nook are documented in this file.

The project follows Semantic Versioning.

---

## Unreleased

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
