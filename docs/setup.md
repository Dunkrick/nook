# Local Setup

This guide explains how to run Nook locally.

---

## Prerequisites

- Node.js 22+
- Docker Desktop (optional, for container testing)
- PostgreSQL or Neon
- Git

---

## Clone

```bash
git clone https://github.com/Dunkrick/nook.git
cd nook
```

---

## Install

```bash
npm install
```

This installs the root workspace dependencies.

---

## Configure Environment

### Backend

Create:

```
backend/.env
```

Example:

```env
PORT=3003

DATABASE_URL=

JWT_SECRET=

FRONTEND_URL=http://localhost:5173
```

---

### Frontend

Create:

```
frontend/.env
```

Example:

```env
VITE_API_URL=http://localhost:3003
```

---

## Database

Generate Prisma Client

```bash
cd backend

npx prisma generate
```

Run migrations

```bash
npx prisma migrate dev
```

---

## Development

From the repository root

```bash
npm run dev
```

This starts both

- frontend
- backend

simultaneously.

---

## URLs

Frontend

```
http://localhost:5173
```

Backend

```
http://localhost:3003
```