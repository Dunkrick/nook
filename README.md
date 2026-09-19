# Nook

> A spatial workspace for capturing thoughts, connecting ideas, and making sense of what matters.

Nook is a full-stack thinking workspace built around a simple idea:

**Thinking should feel spatial before it feels structured.**

Instead of forcing ideas into folders, documents, or rigid workflows, Nook lets users place thoughts directly onto a workspace and interact with them naturally.

**Capture first. Connect naturally. Find clarity next.**

---

## Current capabilities

### Authentication

- User registration and login
- JWT-based authentication
- Protected application routes
- Private user workspaces
- Password visibility control

### Spatial workspace

- Workspace-based artifact model
- Text, link, and Polaroid artifacts
- Free positioning with persisted `x` / `y` coordinates
- Draft artifact creation
- Drag and reposition artifacts
- Inline text editing
- Artifact deletion
- Multi-artifact selection and selection toolbar
- Foundation for future insight-oriented interactions

### Media

- Multipart image uploads through the Nook API
- Private Google Cloud Storage bucket
- Per-user object keys
- JPEG, PNG, and WebP validation
- 10 MB upload limit
- Short-lived signed read URLs for private Polaroid images

### Engineering

- Layered backend architecture: routes → services → Prisma/storage
- Typed artifact domain model
- Pluggable `ObjectStorage` abstraction
- Backend unit tests with Vitest
- Frontend component tests with Vitest
- Type checking and production builds in CI
- Dockerized backend
- Google Cloud Run deployment through GitHub Actions

---

## Architecture

```text
Browser
  │
  ├── React + TypeScript + Vite
  │     ├── pages
  │     ├── components
  │     ├── hooks
  │     └── services
  │
  │ HTTP / JSON + multipart
  ▼
Express + TypeScript
  │
  ├── authentication / validation
  ├── routes
  ├── services
  └── storage abstraction
       ├── Prisma
       └── Google Cloud Storage
              │
              └── private media + signed reads
  │
  ▼
PostgreSQL / Neon
```

The browser never receives public access to the media bucket. A Polaroid image is stored as an `imageKey` in artifact JSON, and the authenticated API verifies ownership before issuing a short-lived signed read URL.

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for request flows and layer responsibilities.

---

## Artifact model

Nook currently represents three artifact types:

| Type       | Meaning                    | Stored content |
| ---------- | -------------------------- | -------------- |
| `TEXT`     | “I thought this”           | `{ text }`     |
| `LINK`     | “I found this”             | `{ url }`      |
| `POLAROID` | “I saw / experienced this” | `{ imageKey }` |

Spatial state is stored independently from artifact content:

- `x`
- `y`
- `zIndex`
- `createdAt`
- `updatedAt`

The database schema lives in `backend/prisma/schema.prisma`.

---

## API surface

### Auth

- `POST /auth/register`
- `POST /auth/login`

### Workspaces

- `GET /workspaces`
- `GET /workspaces/:id`
- `POST /workspaces`
- `GET /workspaces/:workspaceId/artifacts`
- `POST /workspaces/:workspaceId/artifacts`
- `PATCH /workspaces/:workspaceId/artifacts/:id`
- `DELETE /workspaces/:workspaceId/artifacts/:id`

### Media

- `POST /uploads`
- `GET /artifacts/:id/image`

The image endpoint returns JSON containing a signed URL rather than redirecting the browser to Google Cloud Storage.

### Health

- `GET /health`

---

## Tech stack

### Frontend

- React
- TypeScript
- Vite
- React Router
- CSS
- Semantic design tokens
- Vitest

### Backend

- Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT authentication
- Multer
- Google Cloud Storage client
- Vitest

### Infrastructure

- Docker
- Google Cloud Run
- Google Artifact Registry
- Google Cloud Storage
- Neon PostgreSQL
- GitHub Actions

---

## Repository structure

```text
nook/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   └── types/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── domain/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── storage/
│   │   └── types/
│   ├── prisma/
│   ├── Dockerfile
│   └── package.json
│
├── docs/
│   ├── adr/
│   ├── design-system/
│   ├── brand/
│   ├── setup.md
│   └── deployment.md
│
├── ARCHITECTURE.md
├── CHANGELOG.md
├── package.json
└── README.md
```

---

## Local development

Requirements:

- Node.js 22+
- PostgreSQL or a Neon PostgreSQL database
- Git
- Docker Desktop is optional

See [`docs/setup.md`](./docs/setup.md).

```bash
npm install
npm run dev
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:3003`

---

## Testing and builds

Frontend:

```bash
cd frontend
npm test
npm run build
```

Backend:

```bash
cd backend
npm test
npm run typecheck
npm run build
```

The backend CI workflow also builds the Docker image.

---

## Production

The backend is containerized and deployed to Google Cloud Run. GitHub Actions runs on pushes to `main`, builds the backend image, pushes it to Artifact Registry, deploys the image, and verifies the `/health` endpoint.

See [`docs/deployment.md`](./docs/deployment.md).

---

## Project status

Nook is an actively evolving project. The current architecture prioritizes a clear artifact domain, authenticated workspace ownership, private media storage, and explicit interaction boundaries before introducing more advanced AI-assisted functionality.
