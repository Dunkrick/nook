import crypto from "node:crypto";
import { describe, expect, it } from "vitest";

import { isValidGithubSignature } from "./github-webhooks.js";

describe("isValidGithubSignature", () => {
  const secret = "test-secret";
  const payload = Buffer.from(
    JSON.stringify({
      action: "opened",
      test: true,
    }),
  );

  const digest = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  const signature = `sha256=${digest}`;

  it("accepts a valid signature", () => {
    expect(isValidGithubSignature(payload, signature, secret)).toBe(true);
  });

  it("rejects an incorrect secret", () => {
    expect(isValidGithubSignature(payload, signature, "wrong-secret")).toBe(
      false,
    );
  });

  it("rejects a modified payload", () => {
    const modifiedPayload = Buffer.from(
      JSON.stringify({
        action: "closed",
        test: true,
      }),
    );

    expect(
      isValidGithubSignature(modifiedPayload, signature, secret),
    ).toBe(false);
  });

  it("rejects a malformed signature", () => {
    expect(
      isValidGithubSignature(payload, "not-a-github-signature", secret),
    ).toBe(false);
  });
});