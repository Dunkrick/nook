# Deployment

This document describes Nook's backend deployment, production runtime dependencies, GitHub webhook processing, and media storage.

The production API deployment is automated by GitHub Actions when a commit is pushed to `main`. The workflow currently deploys the API service and verifies its `/health` endpoint. The GitHub worker pool is a separate runtime and must be deployed and verified independently unless worker-pool deployment has also been added to the workflow.

## Production architecture

```text
                         Push to main
                              |
                              v
                       GitHub Actions
                              |
                  Build backend Docker image
                              |
                   Tag image with commit SHA
                              |
                              v
                       Artifact Registry
                              |
                   +----------+-----------+
                   |                      |
                   v                      v
            Cloud Run API          Cloud Run Worker Pool
             nook-backend           nook-github-worker
                   |                      ^
                   | publish              | consume
                   v                      |
             CloudAMQP / RabbitMQ --------+
                   |
                   v
             Event processing
                   |
                   v
             Neon PostgreSQL

Cloud Run API and worker also use Google Cloud Storage / Secret Manager
where their runtime configuration and permissions require them.
```

The API and worker can use the same container image, but they run different commands:

- API: `node dist/server.js` (the Dockerfile default).
- Worker: `node dist/queue/github-worker.js`.

A successful API deployment does **not** by itself prove that the worker pool is running or consuming messages.

## Production components

| Component          | Name / provider                            | Responsibility                                                                                                                        |
| ------------------ | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| API                | Cloud Run service `nook-backend`           | HTTP API and GitHub webhook endpoint                                                                                                  |
| Worker             | Cloud Run Worker Pool `nook-github-worker` | Asynchronous GitHub event processing                                                                                                  |
| Container registry | Google Artifact Registry                   | Stores versioned backend images                                                                                                       |
| Database           | Neon PostgreSQL                            | Persistent application and artifact data                                                                                              |
| Message broker     | CloudAMQP / RabbitMQ                       | Queueing, retries, and dead-letter handling for webhook events                                                                        |
| Object storage     | Google Cloud Storage                       | Private media objects                                                                                                                 |
| Secrets            | Google Cloud Secret Manager                | Runtime credentials and secret configuration                                                                                          |
| CI/CD              | GitHub Actions                             | Builds and deploys the API on pushes to `main`; worker deployment is automated only if its deployment step is present in the workflow |

## GitHub webhook processing

GitHub issue synchronization uses an asynchronous pipeline:

```text
GitHub
  |
  | POST webhook
  v
Cloud Run API: nook-backend
  |
  | verify signature and validate delivery metadata
  v
RabbitMQ publisher
  |
  | publish event
  v
RabbitMQ queues
  |
  | consume
  v
Cloud Run Worker Pool: nook-github-worker
  |
  | process event / Prisma
  v
Neon PostgreSQL
```

### API endpoint

The API receives GitHub webhook deliveries at:

```text
POST /webhooks/github
```

The webhook signature is verified using `GITHUB_WEBHOOK_SECRET`. The API validates required delivery/event metadata and publishes accepted events to RabbitMQ. The HTTP success response should only be returned after the broker confirms publication.

### Worker

The worker runs separately from the HTTP API:

```text
Cloud Run Worker Pool: nook-github-worker
Command: node dist/queue/github-worker.js
CPU: 1
Memory: 512 MiB
```

These values describe the configured worker runtime previously observed. Confirm the active Cloud Run Worker Pool revision in Google Cloud before relying on them as current production state.

The worker initializes or asserts the queue topology before consuming messages. It must have valid database and broker configuration and the IAM permissions required by any Google Cloud services it accesses.

### RabbitMQ queues and retry behavior

The configured queue names are:

```text
github-events
github-events-retry-1
github-events-retry-2
github-events-retry-3
github-events-dlq
```

The documented retry delays are 5, 10, and 20 seconds. Malformed messages are routed to the dead-letter queue (DLQ). Permanent/domain failures can be dead-lettered directly; transient failures are retried within the bounded retry policy. Message acknowledgements must follow successful processing or confirmed publication to the relevant retry/DLQ destination.

RabbitMQ is hosted by CloudAMQP. `RABBITMQ_URL` is a secret and must not be committed to the repository or printed in logs.

## Runtime configuration and secrets

### Secret Manager values

| Environment variable    | Secret Manager secret        |
| ----------------------- | ---------------------------- |
| `DATABASE_URL`          | `nook-database-url`          |
| `JWT_SECRET`            | `nook-jwt-secret`            |
| `RABBITMQ_URL`          | `nook-rabbitmq-url`          |
| `GITHUB_WEBHOOK_SECRET` | `nook-github-webhook-secret` |

The current worker configuration references secret version `latest`. Keep secret values in Secret Manager; workflows should reference secret names and versions rather than embedding secret values.

### Non-secret environment variables

| Variable          | Purpose                                    |
| ----------------- | ------------------------------------------ |
| `FRONTEND_URL`    | Frontend origin used by the backend        |
| `GCS_BUCKET_NAME` | Google Cloud Storage bucket used for media |

The previously configured worker values are:

```text
FRONTEND_URL=https://nookmy.vercel.app
GCS_BUCKET_NAME=nook-media-438271
```

The API deployment workflow explicitly updates `GCS_BUCKET_NAME=nook-media-438271`. It does not explicitly set every runtime variable on each deployment; existing Cloud Run service configuration is retained unless a deployment command changes it.

Do not assume that API environment configuration automatically applies to the worker pool. Configure and verify the API and worker independently.

## GitHub Actions deployment

The workflow file is `.github/workflows/deploy-backend.yml`. It runs on pushes to `main`.

### What the current workflow does

The current workflow:

1. Checks out the repository.
2. Authenticates to Google Cloud using the `GCP_SA_KEY` GitHub Actions secret.
3. Checks the Google Cloud identity, project context, and Artifact Registry repository.
4. Configures Docker authentication for Artifact Registry.
5. Builds the backend image from the `backend` directory.
6. Tags the image with `${{ github.sha }}`.
7. Pushes the image to Artifact Registry.
8. Deploys the image to the Cloud Run API service `nook-backend`.
9. Updates the API's `GCS_BUCKET_NAME` environment variable.
10. Requests the deployed API's `/health` endpoint and fails the workflow if the request is unsuccessful.

The workflow currently shown in the repository does **not** contain a `gcloud run worker-pools deploy` step. Therefore, worker-pool deployment is not yet automated by this workflow.

### Image naming

The current GitHub Actions workflow builds and pushes images using this pattern:

```text
REGION-docker.pkg.dev/PROJECT_ID/nook-backend/backend:COMMIT_SHA
```

For the configured production project and region:

```text
asia-south1-docker.pkg.dev/nook-438271/nook-backend/backend:COMMIT_SHA
```

Use the same SHA-tagged image for the API and worker when deploying both from the same commit. The tag identifies the build; for strict revision-to-image verification, compare the resolved image digest in Cloud Run with the digest in Artifact Registry.

### GitHub Actions secrets

| Secret           | Purpose                                                         |
| ---------------- | --------------------------------------------------------------- |
| `GCP_SA_KEY`     | Google Cloud service-account credentials used by GitHub Actions |
| `GCP_PROJECT_ID` | Google Cloud project ID                                         |
| `GCP_REGION`     | Artifact Registry and Cloud Run region                          |

The checked-in workflow also contains explicit production values for API diagnostics and its service account. If those values change, update the workflow consistently. Do not put credentials or secret values in this document.

### Worker-pool automation follow-up

To make worker deployment reproducible, add a worker deployment step to `.github/workflows/deploy-backend.yml` after the image has been pushed. It should deploy the same SHA-tagged image to `nook-github-worker`, explicitly select the worker command, preserve the configured CPU/memory, and reference runtime secrets by Secret Manager name.

Before merging this workflow change, verify the supported `gcloud run worker-pools deploy` flags against the installed Google Cloud CLI and confirm the existing worker's service account and other settings. The documented worker configuration is not proof that the current workflow already applies it.

The intended worker settings to preserve are:

```text
Worker pool: nook-github-worker
Image:       same SHA-tagged image as the API
Command:     node
Argument:    dist/queue/github-worker.js
CPU:         1
Memory:      512 MiB
```

The deployment step should reference secrets by name rather than interpolate their values into logs or source files:

```text
DATABASE_URL=nook-database-url:latest
JWT_SECRET=nook-jwt-secret:latest
RABBITMQ_URL=nook-rabbitmq-url:latest
GITHUB_WEBHOOK_SECRET=nook-github-webhook-secret:latest
```

Only mark worker deployment as automated after the workflow includes the step and a successful run is verified in GitHub Actions and Cloud Run.

## Manual API deployment

Prefer GitHub Actions for routine production API deployments so the deployed image is tied to a commit SHA.

The image is built from the `backend` directory using `backend/Dockerfile`. For an Apple Silicon development machine, build an `amd64` image if required by the target runtime:

```bash
docker buildx build \
  --platform linux/amd64 \
  -t asia-south1-docker.pkg.dev/nook-438271/nook-backend/backend:manual \
  --load \
  ./backend
```

Push:

```bash
docker push \
  asia-south1-docker.pkg.dev/nook-438271/nook-backend/backend:manual
```

Deploy the API:

```bash
gcloud run deploy nook-backend \
  --image asia-south1-docker.pkg.dev/nook-438271/nook-backend/backend:manual \
  --region asia-south1 \
  --project nook-438271 \
  --platform managed \
  --allow-unauthenticated
```

This manual example uses a convenience tag (`manual`); use a unique commit/build tag for traceable production releases. Ensure the service's existing environment variables, secrets, service account, and access settings remain correct before using a manual deployment command.

## Health and production verification

After an API deployment, retrieve the service URL and call the health endpoint:

```bash
URL="$(gcloud run services describe nook-backend \
  --project=nook-438271 \
  --region=asia-south1 \
  --format='value(status.url)')"

curl --fail --silent --show-error --max-time 30 "$URL/health"
```

The GitHub Actions workflow performs a `/health` request after API deployment. A non-success HTTP response causes the workflow to fail. The health endpoint has previously reported API status, database connectivity, and an application version; response fields can change, so use the actual response rather than treating an example as a permanent schema.

An API health check does **not** verify RabbitMQ publication, worker consumption, or end-to-end issue synchronization.

### Worker verification

After deploying or changing the worker pool:

1. Inspect the active `nook-github-worker` revision in Cloud Run.
2. Verify that its image corresponds to the intended commit/digest.
3. Verify its command is `node dist/queue/github-worker.js`.
4. Verify the required environment variables and Secret Manager references.
5. Inspect worker logs for successful startup, RabbitMQ connection, topology setup, and consumer registration.
6. Send a controlled GitHub issue event and verify it is processed.
7. Confirm the expected artifact is persisted/updated in Neon PostgreSQL.
8. Check retry and dead-letter behavior for a controlled failure where practical.

Do not consider deployment complete solely because the API health endpoint returns success.

## Google Cloud Storage

Nook stores private Polaroid images in Google Cloud Storage. The object naming pattern is:

```text
uploads/users/{userId}/{uuid}.{extension}
```

The bucket is configured for private access with uniform bucket-level access and public access prevention.

The backend generates short-lived signed read URLs after verifying artifact ownership.

### Current upload flow

Nook does **not** currently use browser-to-GCS signed `PUT` uploads. The current flow sends the upload to the API:

```text
Browser
  |
  | POST /uploads
  v
Express + Multer
  |
  v
ObjectStorage
  |
  v
Google Cloud Storage
```

The signed URL is for reading private images, not uploading them.

## Google Cloud IAM and credentials

The Cloud Run runtime identity needs permission to access the media bucket and generate signed URLs using the application's configured signing flow.

The API deployment workflow currently specifies this service account:

```text
902490290476-compute@developer.gserviceaccount.com
```

Verify the active service account on the API and worker independently; do not assume they use the same identity. Grant only the permissions required by each runtime.

For local development, use Application Default Credentials where supported. Do not commit service-account key files or credentials to the repository.

## CORS

The browser sends uploads to the Nook API rather than directly to Google Cloud Storage. Therefore, GCS CORS configuration for browser `PUT` uploads is not part of the current upload architecture.

The browser still requests the signed GCS read URL when rendering a private Polaroid image.

## Deployment failure behavior

| Stage                                       | Expected behavior                                                           |
| ------------------------------------------- | --------------------------------------------------------------------------- |
| Google Cloud authentication or access check | Workflow stops                                                              |
| Artifact Registry repository verification   | Workflow stops                                                              |
| Docker image build                          | Workflow stops                                                              |
| Image push                                  | Workflow stops                                                              |
| Cloud Run API deployment                    | Workflow stops                                                              |
| API `/health` check                         | Workflow fails on an unsuccessful HTTP response                             |
| Worker-pool deployment                      | Not covered by the current workflow until a worker deployment step is added |
| Worker startup / queue consumption          | Must be verified separately; API health alone does not cover it             |

## Production checklist

### API

- [ ] `DATABASE_URL` is configured through Secret Manager.
- [ ] `JWT_SECRET` is configured through Secret Manager.
- [ ] `FRONTEND_URL` is correct.
- [ ] `GCS_BUCKET_NAME` is correct.
- [ ] API runtime identity has the required storage and signing permissions.
- [ ] Database is reachable from Cloud Run.
- [ ] The deployed image corresponds to the intended commit/digest.
- [ ] `/health` returns a successful HTTP response.

### GitHub webhook pipeline

- [ ] `RABBITMQ_URL` and `GITHUB_WEBHOOK_SECRET` are configured for the API.
- [ ] The webhook URL is configured in GitHub repository settings.
- [ ] GitHub webhook deliveries succeed.
- [ ] RabbitMQ publication is confirmed before the API acknowledges the webhook.
- [ ] Retry and dead-letter queues exist and behave as expected.
- [ ] `nook-github-worker` is deployed with `node dist/queue/github-worker.js`.
- [ ] Worker secrets and non-secret environment variables are configured.
- [ ] Worker logs show successful broker connection and consumer registration.
- [ ] A real or controlled GitHub issue event is processed and persisted correctly.

### CI/CD

- [ ] `.github/workflows/deploy-backend.yml` passes validation.
- [ ] API deployment and health verification succeed in GitHub Actions.
- [ ] If worker-pool automation is added, the same workflow run deploys the same SHA-tagged image to the worker pool.
- [ ] Worker-pool deployment is verified independently; do not infer success from API deployment alone.
