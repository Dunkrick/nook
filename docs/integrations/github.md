# GitHub Integration

Nook's GitHub integration connects project thinking in Nook with work happening in GitHub.

The current integration is intentionally one-way:

```text
GitHub repository
        ↓
Nook workspace
        ↓
GitHub issue
        ↓
Nook artifact
```

The integration is implemented as an asynchronous event-driven pipeline so webhook processing is decoupled from the HTTP request lifecycle.

---

## Architecture

```text
GitHub
  │
  │ HTTPS webhook
  ▼
Nook API
  │
  │ HMAC verification
  │
  │ publish event
  ▼
RabbitMQ
  │
  │ consume
  ▼
GitHub Worker
  │
  │ Prisma
  ▼
PostgreSQL / Neon
  │
  ▼
Nook Artifact
```

The API is responsible for:

- webhook authentication
- request parsing
- event publication

The worker is responsible for:

- asynchronous event processing
- repository/workspace resolution
- GitHub issue synchronization
- idempotency
- persistence
- retries
- dead-letter handling

---

## Webhook Endpoint

```text
POST /webhooks/github
```

The GitHub webhook route is registered before the application's normal JSON parser:

```ts
app.use(
  "/webhooks/github",
  express.raw({ type: "application/json" }),
  githubWebhookRouter,
);

app.use(express.json());
```

The raw request body is required because GitHub calculates the webhook signature from the exact request payload.

The webhook route reads:

```text
X-GitHub-Delivery
X-GitHub-Event
X-GitHub-Signature-256
```

---

## Webhook Authentication

GitHub webhook requests are authenticated using:

```text
HMAC-SHA256
```

with:

```text
GITHUB_WEBHOOK_SECRET
```

The calculated signature is compared using a timing-safe comparison.

Invalid or missing signatures are rejected with:

```text
401 Unauthorized
```

The API does not enqueue unauthenticated events.

---

## Event Publication

After signature verification, the API publishes the event to RabbitMQ.

The API does not synchronize the GitHub issue synchronously.

```text
Webhook request
      ↓
Verify signature
      ↓
Publish event
      ↓
Return HTTP 200
```

This keeps the webhook request independent of database synchronization latency.

---

# RabbitMQ

RabbitMQ provides the asynchronous boundary between webhook ingestion and GitHub synchronization.

The following queues are used:

```text
github-events
github-events-retry-1
github-events-retry-2
github-events-retry-3
github-events-dlq
```

## Retry topology

```text
github-events
      │
      │ processing failure
      ▼
retry-1
  5 seconds
      │
      ▼
github-events
      │
      │ failure
      ▼
retry-2
  10 seconds
      │
      ▼
github-events
      │
      │ failure
      ▼
retry-3
  20 seconds
      │
      ▼
github-events
      │
      │ final failure
      ▼
DLQ
```

Retry queues use RabbitMQ message TTL and dead-letter routing.

---

## Message acknowledgement

Messages are acknowledged only after successful processing.

```text
consume
   ↓
process
   ↓
database transaction succeeds
   ↓
ACK
```

If processing fails, the event enters the retry/DLQ path.

If publishing to a retry queue or the DLQ fails, the original message is not acknowledged so RabbitMQ can redeliver it.

---

## Worker startup

The GitHub worker initializes the RabbitMQ topology before consuming messages:

```ts
await setupGithubQueue();
const channel = await getRabbitChannel();
```

This means the worker does not depend on another application process having created the queues first.

The startup flow is:

```text
Worker starts
    ↓
setupGithubQueue()
    ↓
Queue topology asserted
    ↓
RabbitMQ channel created
    ↓
github-events consumed
```

---

# Webhook Idempotency

GitHub webhook deliveries are not assumed to be exactly-once.

The `X-GitHub-Delivery` value is stored as a unique `deliveryId`.

```prisma
model WebhookDelivery {
  id          Int       @id @default(autoincrement())
  deliveryId  String    @unique
  event       String
  status      String    @default("RECEIVED")
  receivedAt  DateTime  @default(now())
  processedAt DateTime?
}
```

The worker checks the delivery ID before processing.

```text
Receive event
     ↓
Check deliveryId
     ↓
Already processed?
   /       \
 yes       no
  ↓         ↓
skip      process
```

This protects the system from duplicate webhook deliveries.

---

# Transaction Boundary

GitHub synchronization and webhook-delivery persistence are performed within the same Prisma transaction.

Conceptually:

```text
BEGIN
   ↓
Check deliveryId
   ↓
Synchronize GitHub issue
   ↓
Record WebhookDelivery
   ↓
COMMIT
   ↓
ACK RabbitMQ message
```

If the transaction fails, the database changes are rolled back and the message remains eligible for retry.

---

# GitHub Repository Mapping

A GitHub repository is mapped to a Nook workspace through `GithubRepository`.

```prisma
model GithubRepository {
  id          Int       @id @default(autoincrement())
  owner       String
  name        String
  userId      Int
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  workspaceId Int
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  createdAt   DateTime  @default(now())

  @@unique([owner, name])
  @@index([workspaceId])
}
```

The mapping flow is:

```text
GitHub owner/name
       ↓
GithubRepository
       ↓
workspaceId
       ↓
Nook artifact
```

---

# GitHub Issue Synchronization

GitHub issue synchronization is implemented in:

```text
backend/src/services/github-sync.ts
```

The worker currently handles:

```text
issues
```

events for:

```text
opened
edited
closed
reopened
```

Pull requests are ignored even when delivered through the GitHub `issues` event family.

```ts
if (payload.issue?.pull_request) return null;
```

---

# Artifact Identity

A GitHub issue is identified using:

```text
owner/name#issueNumber
```

For example:

```text
Dunkrick/webhook-test#6
```

The artifact stores:

```text
source = github
externalId = Dunkrick/webhook-test#6
```

The artifact uses an upsert so subsequent GitHub events update the existing artifact.

```text
GitHub issue #6
      ↓
Dunkrick/webhook-test#6
      ↓
existing Artifact?
   /          \
 yes          no
  ↓            ↓
update       create
```

This prevents edits, closes, and reopens from creating duplicate Nook artifacts.

---

# Persisted GitHub Content

GitHub issue information is stored in the artifact's JSON content:

```json
{
  "source": "github",
  "repository": "Dunkrick/webhook-test",
  "issueNumber": 6,
  "title": "Production E2E Test - Updated",
  "body": "Testing GitHub → Nook production infrastructure.",
  "state": "open",
  "url": "https://github.com/Dunkrick/webhook-test/issues/6",
  "author": "Dunkrick"
}
```

The synchronized artifact uses:

```text
type = LINK
```

---

# Supported Lifecycle

The production integration has been validated across:

```text
opened
   ↓
edited
   ↓
closed
   ↓
reopened
```

All events for the same GitHub issue updated the same Nook artifact.

Example:

```text
GitHub issue
Dunkrick/webhook-test#6
        ↓
Nook Artifact #66
```

The artifact remained:

```text
id = 66
externalId = Dunkrick/webhook-test#6
```

while its content state changed:

```text
open
 ↓
closed
 ↓
open
```

---

# Production Infrastructure

The production runtime is:

```text
GitHub
  ↓
Cloud Run API
  ↓
CloudAMQP / RabbitMQ
  ↓
Cloud Run Worker Pool
  ↓
Neon PostgreSQL
```

The API runs as:

```text
Cloud Run service: nook-backend
Region: asia-south1
```

The worker runs as:

```text
Cloud Run Worker Pool: nook-github-worker
Region: asia-south1
```

Both runtimes use the same immutable container image.

---

# Production Secrets

Runtime secrets are stored in Google Secret Manager:

```text
nook-database-url
nook-jwt-secret
nook-rabbitmq-url
nook-github-webhook-secret
```

Non-secret configuration remains environment configuration:

```text
FRONTEND_URL
GCS_BUCKET_NAME
```

Secrets are injected into both the API and worker runtime.

---

# Failure Model

The integration distinguishes the infrastructure flow into:

```text
HTTP authentication failure
        ↓
reject request

RabbitMQ processing failure
        ↓
retry

Repeated processing failure
        ↓
DLQ

Successful database transaction
        ↓
ACK
```

A future refinement should distinguish transient failures from permanent/domain failures so that errors such as an unmapped repository do not unnecessarily consume all retry attempts.

---

# Future Direction

The current implementation is intentionally GitHub → Nook.

Planned evolution:

```text
V1
GitHub → Nook synchronization

V2
Nook → GitHub issue creation

V3
Bidirectional state synchronization

V4
Ideas → Issues → PRs → Shipped
```

The GitHub integration is infrastructure supporting Nook's broader project-thinking workflow rather than the product endpoint itself.
