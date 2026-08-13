# Deployment

Nook's backend is deployed using Docker and Google Cloud Run.

---

## Stack

- Docker
- Google Artifact Registry
- Google Cloud Run
- Neon PostgreSQL

---

## Build

```bash
cd backend

docker buildx build \
  --platform linux/amd64 \
  -t asia-south1-docker.pkg.dev/<PROJECT_ID>/nook-backend/nook-backend:latest \
  --load \
  .
```

---

## Push

```bash
docker push \
asia-south1-docker.pkg.dev/<PROJECT_ID>/nook-backend/nook-backend:latest
```

---

## Deploy

```bash
gcloud run deploy nook-backend \
  --image asia-south1-docker.pkg.dev/<PROJECT_ID>/nook-backend/nook-backend:latest \
  --region asia-south1 \
  --platform managed \
  --allow-unauthenticated
```

---

## Environment Variables

Cloud Run requires:

- DATABASE_URL
- JWT_SECRET
- FRONTEND_URL

---

## Production

Current production backend

```
https://nook-backend-902490290476.asia-south1.run.app
```