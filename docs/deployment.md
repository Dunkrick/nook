# Deployment

This document describes Nook's backend deployment, production runtime dependencies, GitHub webhook processing, and media storage on AWS (Free Tier).

For the step-by-step AWS provisioning guide (EC2, RDS, S3, Docker Compose), see [`docs/aws-setup.md`](./aws-setup.md).

---

## Production architecture

```text
                         Push to main
                               |
                               v
                         GitHub Actions
                               |
                   +-----------+-----------+
                   |                       |
                   v                       v
         Prisma migrate deploy     Deploy via SSH
          (Neon / AWS RDS)                 |
                                           v
                                     AWS EC2 Host
                                           |
                                  Docker Compose
                                           |
                    +----------------------+----------------------+
                    |                      |                      |
                    v                      v                      v
               Nook API               GitHub Worker            RabbitMQ
             nook-backend          nook-github-worker          (Broker)
                    |                      ^
                    | publish              | consume
                    +----------------------+
                               |
                               v
                     Neon / RDS PostgreSQL
                               |
                               v
                         AWS S3 Bucket
                     (or LocalStorage Fallback)
```

The API and worker share the same container image but execute different commands:
- **API**: `node dist/server.js` (default container command).
- **Worker**: `node dist/queue/github-worker.js`.

---

## Production components

| Component      | Provider / Runtime            | Responsibility                                              |
| -------------- | ----------------------------- | ----------------------------------------------------------- |
| API            | Docker on AWS EC2             | HTTP API and GitHub webhook endpoint                        |
| Worker         | Docker on AWS EC2             | Asynchronous GitHub event processing & sync                 |
| Message broker | Docker RabbitMQ on EC2        | AMQP queues, retries, and dead-letter handling              |
| Database       | Neon PostgreSQL or AWS RDS    | Persistent application, workspace, and artifact data        |
| Object storage | AWS S3 (or LocalStorage)      | Private Polaroid media objects and presigned read URLs      |
| CI/CD          | GitHub Actions (`deploy.yml`) | Runs migrations and pulls latest containers on push to main |

---

## Environment configuration

Production runs with environment variables supplied via `.env` on the EC2 host:

```env
PORT=3003
FRONTEND_URL=https://nookmy.vercel.app

# Database (Neon or RDS)
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require

# Authentication
JWT_SECRET=your-production-jwt-secret

# Storage
STORAGE_PROVIDER=s3
S3_BUCKET_NAME=nook-media-production
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your-iam-access-key
AWS_SECRET_ACCESS_KEY=your-iam-secret-key
BACKEND_URL=https://api.yourdomain.com

# Queue & Webhooks
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
GITHUB_WEBHOOK_SECRET=your-webhook-secret
```

---

## Automated Deployment (GitHub Actions)

When code is merged into `main`, `.github/workflows/deploy-backend.yml` automatically:
1. Checks out the repository.
2. Applies pending Prisma migrations (`npx prisma migrate deploy`).
3. Connects to the AWS EC2 instance over SSH (using `EC2_HOST` and `EC2_SSH_KEY`).
4. Pulls latest changes and triggers `docker compose -f backend/docker-compose.aws.yml up -d --build`.

### Required GitHub Secrets

| Secret Name    | Description                                             |
| -------------- | ------------------------------------------------------- |
| `DATABASE_URL` | PostgreSQL connection string for Prisma migration step  |
| `EC2_HOST`     | Public IPv4 address or DNS of your AWS EC2 instance     |
| `EC2_USER`     | SSH username (`ubuntu` for Ubuntu AMIs)                 |
| `EC2_SSH_KEY`  | Private SSH key (`.pem`) authorized in `authorized_keys`|

---

## Health check & Verification

After deployment, verify the backend status:

```bash
curl -s https://<YOUR_DOMAIN_OR_IP>/health
```

Expected response:
```json
{"status":"ok","database":"connected","version":"1.1.0"}
```
