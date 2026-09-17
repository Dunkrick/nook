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
- `GCS_BUCKET_NAME`

---

## Object Storage (Google Cloud Storage)

Media artifacts (Polaroids) are stored in Google Cloud Storage.

### Bucket CORS Configuration

Direct uploads (via signed `PUT` URLs) from the web browser require CORS enabled on the storage bucket.

Create `cors.json`:
```json
[
  {
    "origin": [
      "https://nookmy.vercel.app",
      "http://localhost:5173"
    ],
    "method": ["GET", "PUT"],
    "responseHeader": ["Content-Type"],
    "maxAgeSeconds": 3600
  }
]
```

Apply the configuration:
```bash
gcloud storage buckets update gs://YOUR_BUCKET_NAME --cors-file=cors.json
```

---

## Production

```
https://nook-backend-902490290476.asia-south1.run.app
```