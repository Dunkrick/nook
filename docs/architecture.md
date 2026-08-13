# Architecture

Nook is a full-stack workspace composed of an independent React frontend and an Express backend communicating through a REST API.

The architecture favors simple, replaceable components with clear ownership. Every layer has a single responsibility and communicates only with the layer immediately below it.

---

## High-Level Architecture

```text
                Browser
                    │
                    ▼
          React + TypeScript
                    │
          HTTP (REST + JWT)
                    │
                    ▼
          Express + TypeScript
                    │
              Route Layer
                    │
             Service Layer
                    │
               Prisma ORM
                    │
                    ▼
            Neon PostgreSQL
```

---

## Backend Request Lifecycle

```text
Browser
   │
   ▼
Authentication (JWT)
   │
   ▼
Middleware
   │
   ▼
Routes
   │
   ▼
Services
   │
   ▼
Prisma
   │
   ▼
PostgreSQL
```

### Responsibilities

**Authentication**

- Authenticates users.
- Issues and validates JWTs.

**Middleware**

- Authentication
- Validation
- Error handling

**Routes**

- Understand HTTP.
- Parse requests.
- Return responses.
- Delegate business logic.

**Services**

- Own business rules.
- Remain independent of Express.
- Coordinate persistence.

**Prisma**

- Type-safe data access.
- Maps application models to PostgreSQL.

---

## Frontend Architecture

```text
Pages
   │
   ▼
Components
   │
   ▼
Services
   │
   ▼
REST API
```

The frontend follows a simple ownership model.

- Pages own application state.
- Components own presentation and interaction.
- Services own network communication.

---

## Design Principles

- One responsibility per layer.
- Pass data instead of framework objects.
- Optimistic interactions wherever possible.
- Stateless backend.
- Clear ownership over shared state.
- Simplicity over abstraction.

---

## Deployment

```text
React Frontend
       │
       ▼
Cloud Run (Express)
       │
       ▼
Prisma ORM
       │
       ▼
Neon PostgreSQL
```

The frontend and backend are deployed independently, allowing each application to evolve without coupling deployment pipelines.