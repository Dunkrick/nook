/**
 * Signals that a GitHub event cannot ever be successfully processed,
 * regardless of how many times it is retried. Workers should route
 * messages that produce this error directly to the DLQ.
 *
 * Examples: unmapped repository, invalid payload shape.
 *
 * Do NOT throw this for infrastructure failures (DB down, network
 * timeouts). Those must remain retryable.
 */
export class PermanentGithubEventError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PermanentGithubEventError";
  }
}
