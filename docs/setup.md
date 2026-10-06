# Local Setup

This guide explains how to run Nook locally.

---

## Prerequisites

- Node.js 22+
- PostgreSQL or a Neon PostgreSQL database
- Git
- Docker Desktop (recommended for running RabbitMQ locally)

---

## Clone

```bash
git clone https://github.com/Dunkrick/nook.git
cd nook
```

---

## Install dependencies

From the repository root:

```bash
npm install
```

The root project uses `concurrently` to run the frontend and backend together.

---

## Environment variables

### Backend

Create:

```text
backend/.env
```

Example:

```env
PORT=3003

DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE

JWT_SECRET=replace-with-a-long-random-secret

FRONTEND_URL=http://localhost:5173

GCS_BUCKET_NAME=your-gcs-bucket

RABBITMQ_URL=amqp://guest:guest@localhost:5672

GITHUB_WEBHOOK_SECRET=your-local-webhook-secret
```

Required backend variables:

| Variable                | Purpose                                           |
| ----------------------- | ------------------------------------------------- |
| `PORT`                  | Local API port; defaults to `3003`                |
| `DATABASE_URL`          | PostgreSQL connection string                      |
| `JWT_SECRET`            | JWT signing secret                                |
| `FRONTEND_URL`          | Frontend URL used by the deployment configuration |
| `GCS_BUCKET_NAME`       | Google Cloud Storage bucket used for media        |
| `RABBITMQ_URL`          | RabbitMQ connection string                        |
| `GITHUB_WEBHOOK_SECRET` | Secret used to verify GitHub webhook signatures   |

For local development involving Polaroid uploads, Google Cloud credentials must also be available to the Google Cloud Storage client through Application Default Credentials.

Do not commit `.env` files or credentials.

### Frontend

Create:

```text
frontend/.env
```

Example:

```env
VITE_API_URL=http://localhost:3003
```

---

## Database setup

Generate the Prisma client:

```bash
cd backend
npx prisma generate
```

Apply development migrations:

```bash
npx prisma migrate dev
```

Return to the repository root:

```bash
cd ..
```

---

## Run the application

From the repository root:

```bash
npm run dev
```

This starts:

- Vite frontend
- Express backend

Default local URLs:

```text
Frontend: http://localhost:5173
Backend:  http://localhost:3003
```

Health check:

```bash
curl http://localhost:3003/health
```

---

## Run services separately

Frontend:

```bash
npm run dev:frontend
```

Backend:

```bash
npm run dev:backend
```

---

## GitHub Integration (Webhooks & RabbitMQ)

To develop or test GitHub issue synchronization locally, you need a running RabbitMQ instance and the background worker.

### 1. Start RabbitMQ

You can run RabbitMQ locally using Docker:

```bash
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```

This starts the broker on port `5672` and the management UI on port `15672` (default credentials: `guest` / `guest`).

### 2. Run the worker

The GitHub sync worker runs separately from the Express API. In a separate terminal, from the `backend` directory, run:

```bash
npm run dev:worker
```

The worker will automatically assert the necessary queue topology on startup and wait for messages.

### 3. Local webhook delivery

To receive webhooks from GitHub on your local machine, use a payload delivery service like [smee.io](https://smee.io/) or [ngrok](https://ngrok.com/).

Using `smee.io`:

1. Navigate to smee.io and "Start a new channel".
2. Configure your GitHub repository webhook to point to the Smee channel URL.
   - Content type: `application/json`
   - Secret: Match your local `GITHUB_WEBHOOK_SECRET`
   - Events: `Issues`
3. Forward the payloads to your local backend:

```bash
npx smee-client --url https://smee.io/YOUR_CHANNEL_ID --path /webhooks/github --port 3003
```

---

## Tests

Frontend:

```bash
cd frontend
npm test
```

Backend:

```bash
cd backend
npm test
```

Backend type checking:

```bash
npm run typecheck
```

---

## Production builds

From the repository root:

```bash
npm run build
```

This builds the backend and frontend.

Backend only:

```bash
cd backend
npm run build
```

Frontend only:

```bash
cd frontend
npm run build
```

---

## Docker

The backend includes a Dockerfile.

From the repository root:

```bash
docker build -t nook-backend ./backend
```

The production image is intended to run the compiled backend with Node.js.

For Apple Silicon hosts, production deployment images should target `linux/amd64`, matching the Cloud Run runtime.

---

## Media development

Polaroid uploads use:

```text
Browser
  ↓ multipart/form-data
POST /uploads
  ↓
Nook API
  ↓
Google Cloud Storage
```

The browser does not upload directly to GCS.

Supported image types:

- JPEG
- PNG
- WebP

Maximum size:

```text
10 MB
```

Uploaded objects use keys in the form:

```text
uploads/users/{userId}/{uuid}.{extension}
```

Polaroid artifacts store the resulting `imageKey` in their JSON content.

---

## Troubleshooting

### Database connection errors

Check:

```text
backend/.env
```

and verify `DATABASE_URL` points to an accessible PostgreSQL database.

### Prisma errors

Regenerate the client:

```bash
cd backend
npx prisma generate
```

If the database schema is behind local migrations:

```bash
npx prisma migrate dev
```

### Image upload errors

Check:

1. `GCS_BUCKET_NAME` is set.
2. Google Cloud credentials are available.
3. The bucket exists.
4. The runtime identity has permission to write objects and generate signed URLs.
5. The image is JPEG, PNG, or WebP and is below 10 MB.

---

## Useful commands

```bash
# Run everything
npm run dev

# Build everything
npm run build

# Backend tests
npm --prefix backend test

# Frontend tests
npm --prefix frontend test

# Backend typecheck
npm --prefix backend run typecheck

# Prisma client
npm --prefix backend exec prisma generate

# Prisma migrations
npm --prefix backend exec prisma migrate dev
```
