# ADR-0015: Migration to AWS Free Tier & Pluggable Storage Abstraction

## Context

Nook originally deployed its backend to Google Cloud Run, backed by Google Cloud Storage (GCS) and GCP Artifact Registry. Ongoing idle baseline charges and unexpected operational overhead on GCP led to an architecture review. 

AWS provides an extensive Free Tier for foundational compute, storage, and database services:
- **Compute**: EC2 (`t4g.small` / `t2.micro` / `t3.micro`) eligible for 750 hours/month.
- **Storage**: AWS S3 (5 GB standard storage, 20,000 GET requests, 2,000 PUT requests/month).
- **Database**: AWS RDS PostgreSQL (`db.t4g.micro`, 20 GB SSD storage) or Neon PostgreSQL.

Additionally, local development and off-cloud testing required an offline storage fallback to eliminate hard dependencies on cloud buckets for media artifacts (Polaroids).

## Decision

1. **Retire GCP Services**: Shut down and decommission Google Cloud Run, Cloud Storage, and Artifact Registry.
2. **Adopt AWS S3 Storage Adapter**: Implement `S3Storage` fulfilling the `ObjectStorage` interface using `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner`, generating 15-minute presigned read URLs.
3. **Implement Local Storage Fallback**: Implement `LocalStorage` fulfilling `ObjectStorage`, saving files under `backend/public/uploads` and serving them statically with CORS via Express.
4. **Storage Factory**: Introduce `storage-factory.ts` to switch seamlessly between `local` and `s3` via the `STORAGE_PROVIDER` environment variable.
5. **Containerized Deployment on EC2**: Deploy the API, GitHub synchronization worker, and RabbitMQ broker as Docker containers managed by Docker Compose on an AWS EC2 Free Tier instance.
6. **Preserve Frontend Contracts**: All changes remain backend-internal; the API contract (`POST /uploads` returning object keys, `GET /artifacts/:id/image` returning `{ url }`) remains strictly identical.

## Alternatives Considered

- **AWS Lambda & API Gateway**: Evaluated serverless runtime. Rejected due to cold starts, WebSocket/long-running sync complexity, and added API Gateway request costs compared to flat Free Tier EC2.
- **Render / Railway PaaS**: Evaluated third-party PaaS hosting. Deferred in favor of standard Docker Compose on EC2 to maintain full infrastructural ownership without vendor lock-in.

## Consequences

- Zero baseline hosting cost under AWS Free Tier limits.
- Offline and local development workflows can execute fully without cloud credentials.
- Retains identical security invariants: media files are never publicly browsable without artifact ownership verification.
- Supersedes ADR-0008 (Google Cloud Run deployment).
