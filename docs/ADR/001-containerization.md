# ADR-001: Containerize the Backend

## Status

Accepted

## Context

Nook's backend needed a reproducible runtime that behaves consistently
across local development and production deployments.

The project is intended to be deployed on Google Cloud Run, which
expects applications to run inside OCI-compatible containers.

## Decision

The backend is packaged as a Docker container.

The Docker image:
- installs dependencies
- generates the Prisma client
- builds the TypeScript application
- starts the compiled Express server

The container is verified locally before deployment.

## Alternatives Considered

- Deploy directly to Render
- Deploy directly to Railway
- Deploy without Docker

These were rejected because Docker provides an identical runtime
between development and production.

## Consequences

Positive

- Reproducible environments
- Easier CI/CD
- Compatible with Cloud Run
- Easier onboarding

Tradeoffs

- Slightly longer build times
- Additional Docker maintenance