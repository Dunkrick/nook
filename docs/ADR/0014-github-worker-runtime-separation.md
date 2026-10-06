# ADR-0014: Separate GitHub worker runtime

## Context

The GitHub webhook API receives HTTP requests, while GitHub issue synchronization is asynchronous work.

Running both responsibilities inside the same runtime would couple background processing to API lifecycle and resource usage.

Nook already uses Docker and Google Cloud Run, making a separate worker runtime practical.

## Decision

Run the GitHub synchronization worker as a separate Cloud Run Worker Pool.

The API and worker use the same immutable Docker image but different commands.

API:

```text
node dist/server.js
```

Worker:

```text
node dist/queue/github-worker.js
```

The worker connects to the same RabbitMQ broker and PostgreSQL database as the API.

The worker initializes the RabbitMQ queue topology before consuming messages:

```ts
await setupGithubQueue();
const channel = await getRabbitChannel();
```

## Alternatives

### Run the worker inside the API process

Rejected because HTTP traffic and background processing would share the same runtime resources and lifecycle.

### Deploy a second Docker image

Rejected because it would duplicate the application build and could allow API and worker versions to diverge unnecessarily.

### Run the worker on a traditional VM

Rejected because it introduces additional infrastructure and lifecycle management that is unnecessary for the current workload.

## Consequences

### Positive

- API and worker have independent runtime responsibilities;
- worker failures do not directly terminate the API process;
- worker resources can be configured independently;
- the same immutable image guarantees both runtimes use the same compiled application version;
- queue topology is initialized by the worker itself;
- the architecture maps cleanly to an event-driven production system.

### Negative

- there are now two deployed runtime components;
- operational debugging requires observing API, RabbitMQ, and worker logs;
- worker infrastructure has an additional deployment configuration.

## Status

Accepted
