# Nook

> A spatial workspace for capturing thoughts, connecting ideas, and making sense of what matters.

Nook is a full-stack thinking workspace built around a simple idea:

**Thinking should feel spatial before it feels structured.**

Instead of forcing ideas into folders, documents, or rigid workflows, Nook lets users place thoughts directly onto a workspace and interact with them naturally.

Capture first.

Organize later.

Make meaning when ready.

---

# Vision

Most software asks people to structure their thinking before they have finished thinking.

Nook takes the opposite approach.

The workspace acts like a physical wall:

- place ideas freely
- move them around
- edit them in context
- select related thoughts
- gradually discover patterns

The long-term vision is to evolve Nook into an AI-assisted thinking environment where AI helps users reflect on their ideas without interrupting the act of thinking itself.

---

# Current Capabilities

## Authentication

- User registration
- User login
- JWT-based authentication
- Protected application routes
- Private user workspaces
- Password visibility toggle

## Spatial Workspace

- Artifact-based workspace
- Text artifacts
- Link artifacts
- Double-click creation
- Draft artifact workflow
- Drag and reposition artifacts
- Inline text editing
- Delete artifacts
- Multi-artifact selection
- Selection toolbar
- Insight panel foundation

## Interaction Model

- Explicit interaction states
- Editing state coordinated across the workspace
- Dragging disabled while editing
- Workspace-level editing ownership
- Optimistic artifact updates

## Design System

- Semantic design tokens
- Typography scale
- Spacing system
- Motion tokens
- Elevation tokens
- Interaction state model
- Responsive layouts

---

# Tech Stack

## Frontend

- React
- TypeScript
- Vite
- React Router
- CSS
- Semantic design tokens

## Backend

- Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT authentication

## Infrastructure

- Docker
- Google Cloud Run
- Google Artifact Registry
- Neon PostgreSQL

---

# Repository Structure

```text
nook/

├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   └── types/
│   │
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── src/
│   ├── prisma/
│   ├── Dockerfile
│   └── package.json
│
├── docs/
│   ├── adr/
│   ├── design-system/
│   └── brand/
│
├── ARCHITECTURE.md
├── CHANGELOG.md
├── package.json
└── README.md
```
