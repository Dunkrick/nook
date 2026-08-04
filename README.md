# Nook: Evolving Wall-First Workspace

Nook is a full-stack digital workspace that has evolved from a basic single-file CRUD application into an interactive, wall-first canvas interaction model. 

Instead of building multiple throwaway projects, Nook uses a single core product domain to explore robust architectural evolutions—progressing through SQLite to PostgreSQL, raw SQL queries to Prisma ORM, JavaScript to TypeScript, and finally, incorporating a highly responsive React client.

---

## Project Vision

Traditional kanban boards and note apps feel structured but restrictive. Nook's vision is to build a wall that **thinks like software, but feels like paper**. 

By shifting from a legacy table-based note submission model to a **wall-first spatial model**, users can capture thoughts instantly anywhere on their screen via double-clicks, arrange them organically through drag-and-drop, and visually organize their workspace.

---

## Tech Stack

### Frontend Client
* **Framework**: React 19 (Functional components, custom hooks)
* **Build System**: Vite 8 + TypeScript
* **Styling**: Pure CSS Design Tokens (for responsive layouts and customizable themes)
* **Routing**: React Router DOM v7
* **State Management**: Local React state with unidirectional data-flow callback interfaces

### Backend Service
* **Server**: Express 5 + TypeScript (using `tsx watch` for hot-reloading)
* **Persistence Layer**: Prisma ORM with PostgreSQL database
* **Authentication**: JWT (JSON Web Tokens) with custom stateless middleware
* **Validation**: Custom validation layers checking input coordinates and text lengths

---

## Project Structure

```
systems-builder/
├── src/                      # Express Backend Source
│   ├── server.ts             # App Entry Point
│   ├── routes/               # API Routes & Express Routers
│   ├── services/             # Business Logic & Database Services
│   ├── middleware/           # Auth, Validation & Global Error Handlers
│   └── lib/                  # Shared Constants & Utilities
├── prisma/                   # Schema definitions and migration files
├── nook-frontend/            # React Client Workspace
│   ├── src/
│   │   ├── assets/           # Global Tokens & Stylesheets
│   │   ├── components/       # Wall, Card, and DraftCard Components
│   │   ├── pages/            # View Pages (Home, Login, Register)
│   │   ├── services/         # API Service Wrappers & Network Layer
│   │   ├── types/            # TypeScript Interface Definitions
│   │   └── lib/              # Browser LocalStorage Helpers
│   ├── package.json
│   └── vite.config.ts
├── package.json              # Backend Package Manifest
└── docs/                     # Architectural ADRs and diagrams
```

---

## Setup & Installation

### Prerequisites
* Node.js (v22.x or higher)
* PostgreSQL database instance running locally or hosted

### 1. Repository Setup
Clone the repository and install root dependencies:
```bash
git clone <repository-url>
cd systems-builder
npm install
```

### 2. Environment Variables Configuration
Create a `.env` file in the root directory:
```env
# Backend Environment Setup
PORT=5001
DATABASE_URL="postgresql://<user>:<password>@localhost:5432/nook_db?schema=public"
JWT_SECRET="your_jwt_secret_key_here"
```

Configure the frontend client `.env` inside the `nook-frontend/` directory:
```env
# Frontend Client Setup
VITE_API_URL="http://localhost:5001"
```

### 3. Database Migration
Run the automated setup to run migrations and generate the Prisma Client:
```bash
npm run setup
```

---

## Development Workflow

To start developing local changes on both layers concurrently:

### Run Backend
In the workspace root directory:
```bash
npm run dev
```

### Run Frontend Client
In a new terminal window inside the `nook-frontend/` directory:
```bash
npm install
npm run dev
```
The client application will launch locally at `http://localhost:5173`.

---

## 🔑 Available Scripts

### Root Scripts (Backend & DB)
* `npm run dev`: Starts the Express server using `tsx watch` for active reload.
* `npm run build`: Compiles TypeScript files into the `dist/` production folder.
* `npm run start`: Runs compiled production code from `dist/server.js`.
* `npm run setup`: Generates Prisma clients and migrates the PostgreSQL database.

### Frontend Client Scripts (`nook-frontend/`)
* `npm run dev`: Launches the local Vite development web server.
* `npm run build`: Compiles TSX files and builds static production assets.
* `npm run lint`: Runs ESLint to check for syntax and style issues.
* `npm run preview`: Launches a local preview server for the built production assets.

---

## API Overview

All protected route endpoints require an `Authorization: Bearer <JWT>` header.

| Endpoint | Method | Authentication | Description |
| :--- | :---: | :---: | :--- |
| `/auth/register` | `POST` | Public | Register a new user account |
| `/auth/login` | `POST` | Public | Authenticate credentials & retrieve token |
| `/cards` | `GET` | Protected | Fetch all cards belonging to the logged-in user |
| `/cards` | `POST` | Protected | Create a new card with text and optional (x, y) coordinates |
| `/cards/:id` | `PATCH` | Protected | Update card text content or coordinate position (x, y) |
| `/cards/:id` | `DELETE`| Protected | Delete a card from the user's wall |

---

## Interaction Model

Nook implements an intuitive, wall-first workspace:

```
[Double-Click on Canvas]
         │
         ▼
 ┌───────────────┐
 │   DraftCard   │ ──(Esc Key / Empty Text Commit)──> [Discard Draft]
 └───────────────┘
         │
    (Enter Key)
         │
         ▼
 ┌───────────────┐
 │ Persisted Card│ ──(Pointer Down + Move)─────────> [Drag & Move Position]
 └───────────────┘
         │
    (Edit Click)
         │
         ▼
 ┌───────────────┐
 │  Inline Edit  │ ──(Save / Cancel)───────────────> [Update State]
 └───────────────┘
```

1. **Double Click Canvas**: Spawns a transient `<DraftCardComponent />` at the cursor position.
2. **Focus**: The editor textarea auto-focuses instantly, allowing the user to start typing.
3. **Commit**: Pressing `Enter` (without Shift) commits the note. A request is sent to the backend and a `<CardComponent />` is rendered.
4. **Cancel**: Pressing `Escape` (or clicking away/leaving text empty) removes the draft card.
5. **Drag and Drop**: Users can click and hold any card to drag it to a new location. Moving coordinates are saved to the backend on release.
6. **Double-Click Protection**: Double-clicking inside cards or buttons does not trigger new drafts.

---

## Evolutionary Roadmap

* **Version 1**: Express server, single-file SQLite database (Learn Full Stack).
* **Version 2**: Migrated to PostgreSQL, added TypeScript definitions, extracted controllers.
* **Version 2.5**: Introduced Prisma ORM, routing middlewares, validation rules, global error filters.
* **Version 3 (Current)**: React + Vite Frontend client, Wall-first interaction model, Private Walls via JWT.
* **Version 4**: AI Integration (Analyze user note topics, suggest tags, organize cards automatically).
* **Version 5**: Product Polish (Introduce Canvas panning, snapping to grids, soft animation transitions).