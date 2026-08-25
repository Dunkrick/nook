# Deployment

Nook's backend is deployed via GitHub Actions to Google Cloud Run.

---

## Architecture

| Component          | Role                              |
|--------------------|-----------------------------------|
| GitHub Actions     | CI/CD pipeline                    |
| Docker             | Builds the backend image          |
| Artifact Registry  | Stores versioned images           |
| Cloud Run          | Runs the containerised backend    |
| PostgreSQL (Neon)  | Managed database                  |

---

## Trigger

Pipeline runs on every push to `main`.

---

## Image Naming

```
REGION-docker.pkg.dev/PROJECT_ID/nook-backend/backend:GIT_SHA
```

---

## Deployment Verification

After deploy, the pipeline calls:

```
GET /health
```

A non-2xx response fails the pipeline.

---

## Required GitHub Secrets

| Secret            | Description                        |
|-------------------|------------------------------------|
| `GCP_PROJECT_ID`  | Google Cloud project ID            |
| `GCP_REGION`      | Deployment region                  |
| `GCP_SA_KEY`      | Service account JSON key           |

---

## Failure Semantics

| Step                      | Behaviour on failure        |
|---------------------------|-----------------------------|
| Docker build              | Pipeline stops              |
| Artifact Registry push    | Pipeline stops              |
| Cloud Run deployment      | Pipeline stops              |
| `GET /health` non-2xx     | Pipeline fails              |

---

## Environment Variables

Cloud Run requires:

- `DATABASE_URL`
- `JWT_SECRET`
- `FRONTEND_URL`

---

## Production

```
https://nook-backend-902490290476.asia-south1.run.app
```