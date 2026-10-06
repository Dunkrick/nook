# Deployment

Nook's backend is deployed as a Docker container to Google Cloud Run.

GitHub Actions handles the production deployment when changes are pushed to `main`.

---

## Production architecture

```text
GitHub
  │
  │ push main
  ▼
GitHub Actions
  │
  ├── CI: npm ci
  ├── CI: typecheck
  ├── CI: backend tests
  ├── CI: backend build
  ├── CI: Docker build
  │
  └── Deploy: Docker image → Artifact Registry → Cloud Run
        │
        ▼
Google Artifact Registry
        │
        ▼
Google Cloud Run
        │
        ├── Neon PostgreSQL
        └── Google Cloud Storage
```

---

## GitHub event-processing infrastructure

GitHub issue synchronization uses a separate asynchronous processing pipeline.

```text
GitHub
  │
  │ webhook
  ▼
Cloud Run API
  │
  │ publish
  ▼
CloudAMQP / RabbitMQ
  │
  │ consume
  ▼
Cloud Run Worker Pool
  │
  │ Prisma
  ▼
Neon PostgreSQL
```

### API

The existing Cloud Run service:

```text
nook-backend
```

receives GitHub webhooks at:

```text
POST /webhooks/github
```

The webhook request is authenticated using:

```text
GITHUB_WEBHOOK_SECRET
```

and published to RabbitMQ after signature verification.

### Worker

The GitHub worker runs independently as:

```text
Cloud Run Worker Pool
nook-github-worker
```

The worker command is:

```text
node dist/queue/github-worker.js
```

The worker initializes the RabbitMQ queue topology before consuming messages.

### RabbitMQ

RabbitMQ is hosted by CloudAMQP.

Queues:

```text
github-events
github-events-retry-1
github-events-retry-2
github-events-retry-3
github-events-dlq
```

Retry delays:

```text
5 seconds
10 seconds
20 seconds
```

Repeated failures are moved to the dead-letter queue.

### Runtime secrets

The GitHub processing runtime uses Google Secret Manager for:

```text
DATABASE_URL
JWT_SECRET
RABBITMQ_URL
GITHUB_WEBHOOK_SECRET
```

The corresponding Secret Manager records are:

```text
nook-database-url
nook-jwt-secret
nook-rabbitmq-url
nook-github-webhook-secret
```

Non-secret runtime configuration remains environment-based.

### Deployment safety

GitHub infrastructure was deployed using a zero-traffic Cloud Run revision before production promotion.

The validation sequence was:

```text
Build immutable image
        ↓
Deploy candidate API revision
        ↓
Health check
        ↓
Deploy worker pool
        ↓
Verify worker startup
        ↓
Run real GitHub issue events
        ↓
Verify PostgreSQL persistence
        ↓
Promote candidate revision
```

The API and worker use the same immutable container image.

### Production validation

The production pipeline was verified using a real GitHub repository and issue.

The tested lifecycle was:

```text
opened
  ↓
edited
  ↓
closed
  ↓
reopened
```

All events updated the same Nook artifact.

The production health endpoint returned:

```json
{
  "status": "ok",
  "database": "connected",
  "version": "1.1.0"
}
```

This verifies that the deployed API can start and reach the production database.

### Current production runtime

```text
API:
  nook-backend

Worker:
  nook-github-worker

Database:
  Neon PostgreSQL

Message broker:
  CloudAMQP / RabbitMQ

Container registry:
  Google Artifact Registry
```

---

## Infrastructure

| Component             | Responsibility               |
| --------------------- | ---------------------------- |
| GitHub Actions        | CI/CD                        |
| Docker                | Backend container image      |
| Artifact Registry     | Container image storage      |
| Cloud Run             | HTTP API runtime             |
| Cloud Run Worker Pool | GitHub event processing      |
| CloudAMQP / RabbitMQ  | Asynchronous event transport |
| Neon PostgreSQL       | Relational database          |
| Google Cloud Storage  | Private media storage        |
| Secret Manager        | Production secrets           |

---

## Deployment trigger

The production workflow is:

```text
.github/workflows/deploy-backend.yml
```

It runs on:

```text
push → main
```

The workflow:

1. authenticates to Google Cloud;
2. builds the backend Docker image;
3. tags the image with the Git commit SHA;
4. pushes it to Artifact Registry;
5. deploys the image to Cloud Run;
6. updates the configured GCS bucket environment variable;
7. verifies the deployed `/health` endpoint.

The workflow does not recreate every Cloud Run environment variable on each deployment. Required runtime configuration such as `DATABASE_URL`, `JWT_SECRET`, and `FRONTEND_URL` is maintained on the Cloud Run service.

---

## GitHub Actions secrets

The deployment workflow requires:

| Secret           | Purpose                                    |
| ---------------- | ------------------------------------------ |
| `GCP_PROJECT_ID` | Google Cloud project ID                    |
| `GCP_REGION`     | Cloud Run / Artifact Registry region       |
| `GCP_SA_KEY`     | GitHub Actions service-account credentials |

---

## Runtime environment variables

Cloud Run requires:

```text
DATABASE_URL
JWT_SECRET
FRONTEND_URL
GCS_BUCKET_NAME
```

The backend also reads:

```text
DATABASE_URL
JWT_SECRET
FRONTEND_URL
GCS_BUCKET_NAME
GITHUB_WEBHOOK_SECRET
RABBITMQ_URL
```

Cloud Run supplies the runtime port through its environment.

---

## Container image

The root `package.json` contains the local Docker build and push helpers.

The deployment image follows:

```text
REGION-docker.pkg.dev/PROJECT_ID/nook-backend/nook-backend:latest
```

The GitHub Actions deployment additionally creates SHA-tagged images so deployments can be associated with a specific commit.

---

## Manual deployment

For an Apple Silicon development machine, build an `amd64` image:

```bash
docker buildx build   --platform linux/amd64   -t asia-south1-docker.pkg.dev/nook-438271/nook-backend/nook-backend:latest   --load   ./backend
```

Push:

```bash
docker push   asia-south1-docker.pkg.dev/nook-438271/nook-backend/nook-backend:latest
```

Deploy:

```bash
gcloud run deploy nook-backend   --image asia-south1-docker.pkg.dev/nook-438271/nook-backend/nook-backend:latest   --region asia-south1   --project=nook-438271   --platform managed   --allow-unauthenticated
```

Production deployments should normally use the GitHub Actions workflow rather than manually deploying images.

---

## Health verification

After deployment:

```bash
curl https://YOUR_CLOUD_RUN_URL/health
```

The deployment workflow performs this check automatically.

A non-2xx response causes the workflow to fail.

The health endpoint also checks database connectivity before returning success.

---

## Google Cloud Storage

Nook stores Polaroid images in a private Google Cloud Storage bucket.

Objects use:

```text
uploads/users/{userId}/{uuid}.{extension}
```

The bucket is configured with:

- uniform bucket-level access
- public access prevention
- private object access

The backend generates short-lived signed read URLs after verifying artifact ownership.

### Important

Nook does **not** currently use browser-to-GCS signed `PUT` uploads.

The current upload flow is:

```text
Browser
  ↓
POST /uploads
  ↓
Express + Multer
  ↓
ObjectStorage
  ↓
Google Cloud Storage
```

The signed URL is used for **reading** private images, not for uploading them.

---

## Google Cloud IAM

The Cloud Run runtime identity needs permission to interact with the media bucket and generate signed URLs.

The signing flow uses Google Cloud service-account credentials at runtime.

Local development should use Application Default Credentials rather than committing a service-account key into the repository.

---

## CORS

The current browser upload request is sent to the Nook API, not directly to GCS.

Therefore the old GCS CORS configuration for browser `PUT` uploads is not part of the current upload architecture.

The browser still requests the signed GCS read URL when rendering a private Polaroid image.

---

## Deployment failure semantics

| Stage                   | Failure behavior |
| ----------------------- | ---------------- |
| Dependency installation | Workflow stops   |
| Type check              | Workflow stops   |
| Backend build           | Workflow stops   |
| Docker build            | Workflow stops   |
| Artifact Registry push  | Workflow stops   |
| Cloud Run deployment    | Workflow stops   |
| `/health` verification  | Workflow fails   |

---

## Production checklist

```text
[ ] DATABASE_URL configured
[ ] JWT_SECRET configured
[ ] FRONTEND_URL configured
[ ] GCS_BUCKET_NAME configured
[ ] Cloud Run runtime identity has required storage permissions
[ ] Database is reachable from Cloud Run
[ ] Docker image targets linux/amd64
[ ] /health returns 2xx
[ ] RABBITMQ_URL and GITHUB_WEBHOOK_SECRET are configured
[ ] GitHub Worker is deployed and consuming from queues
[ ] Webhook deliveries are succeeding in GitHub repo settings
```
