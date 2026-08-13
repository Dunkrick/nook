# Nook

> A wall-first workspace that feels like paper but behaves like software.

Nook is a full-stack spatial thinking workspace designed for brainstorming, reflection, and organizing ideas visually.

Instead of forcing thoughts into lists or folders, Nook lets users capture ideas directly on an infinite workspace and evolve them naturally.

---

# Vision

Most productivity tools optimize for managing tasks.

Nook optimizes for thinking.

The goal is to create software that feels closer to pinning notes on a wall than filling out forms.

Future versions will gradually evolve into an AI-assisted thinking workspace while keeping interaction lightweight and distraction-free.

---

# Current Features

- JWT Authentication
- Spatial wall workspace
- Double-click anywhere to create notes
- Draft note workflow
- Drag & drop positioning
- Inline editing
- Delete notes
- Optimistic UI updates
- Multi-card selection
- Insight panel foundation
- Responsive design token system

---

# Tech Stack

## Frontend

- React
- TypeScript
- Vite
- React Router
- CSS Design Tokens

## Backend

- Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication

## Infrastructure

- Docker
- Google Cloud Run
- Google Artifact Registry
- Neon PostgreSQL

---

# Repository Structure

```
nook/

├── frontend/
│   ├── src/
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
│
├── package.json
└── README.md
```

---

# Local Development

## Install

```bash
npm install
```

---

## Start both applications

```bash
npm run dev
```

---

Frontend

```
http://localhost:5173
```

Backend

```
http://localhost:3003
```

---

# Environment Variables

## backend/.env

```env
PORT=3003

DATABASE_URL=

JWT_SECRET=

FRONTEND_URL=http://localhost:5173
```

---

## frontend/.env

```env
VITE_API_URL=http://localhost:3003
```

---

# Production Architecture

```
                React Frontend
                       │
                       ▼
          Google Cloud Run (Express)
                       │
                       ▼
                Prisma ORM
                       │
                       ▼
              Neon PostgreSQL
```

---

# Core Interaction

```
Double Click
      │
      ▼
 Draft Card
      │
      ▼
 Persisted Card
      │
      ▼
 Drag • Edit • Delete
      │
      ▼
 Spatial Workspace
```

---

# Roadmap

## v1.2

- Production frontend deployment
- Connect frontend to Cloud Run
- Polish workspace interactions
- Sticky floating toolbar
- Workspace navigation improvements

---

## v1.3

- Infinite canvas
- Canvas panning
- Zoom
- Rectangle selection
- Keyboard shortcuts

---

## v2.0

- AI Reflection Engine
- Card grouping
- Insight generation
- Theme extraction
- Reflection sessions

---

# Principles

Nook follows a few product principles throughout its evolution.

- Wall-first, never form-first.
- Capture before organization.
- Calm by default.
- AI assists, never interrupts.
- Local interactions should feel immediate.
- Human-first interaction over excessive automation.