# ADR-0013: Event-driven GitHub webhook processing

## Context

Nook needs to synchronize GitHub issues into Nook artifacts.

GitHub webhook requests should not perform the complete synchronization synchronously because database work, transient failures, retries, and future GitHub integrations should not be coupled to the HTTP request lifecycle.

Webhook delivery can also be retried or duplicated, so the processing model must provide durable delivery identity and safe repeated processing.

The system also needs explicit retry and dead-letter behavior for failures.

## Decision

Use GitHub webhooks as the ingestion mechanism and RabbitMQ as the asynchronous processing boundary.

The flow is:

```text
GitHub
  ↓
Nook webhook endpoint
  ↓
HMAC verification
  ↓
RabbitMQ
  ↓
GitHub worker
  ↓
PostgreSQL
```

The webhook endpoint:

1. receives the raw request body;
2. verifies `X-GitHub-Signature-256`;
3. extracts the GitHub delivery ID and event type;
4. publishes the event to RabbitMQ;
5. returns success after publication.

The worker:

1. consumes the event;
2. checks the unique GitHub delivery ID;
3. performs synchronization;
4. records the processed delivery;
5. acknowledges the RabbitMQ message only after successful persistence.

Failures use:

```text
5 second retry
10 second retry
20 second retry
DLQ
```

## Alternatives

### Synchronous processing inside the webhook request

Rejected because GitHub request latency would become coupled to database processing and external failure conditions.

### In-process background jobs

Rejected because the queue would be coupled to the application runtime and would provide weaker isolation between HTTP traffic and background processing.

### RabbitMQ without retry queues

Rejected because transient failures would either immediately fail or require ad-hoc application-level retry logic.

### Database-only event tracking

Rejected because durable delivery tracking alone does not provide an independent asynchronous work queue.

## Consequences

### Positive

- webhook requests remain lightweight;
- processing is asynchronous;
- retries are explicit;
- failed events can be isolated in a DLQ;
- API and worker runtimes can scale independently;
- delivery IDs provide a durable idempotency boundary;
- database persistence can be completed before message acknowledgement.

### Negative

- the system now operates a message broker;
- debugging requires observing both API and worker behavior;
- event processing is eventually consistent rather than synchronous;
- retry/DLQ semantics add operational complexity.

## Status

Accepted
