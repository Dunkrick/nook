import crypto from "node:crypto";

export function isValidGithubSignature(
  payload: Buffer,
  signature: string,
  secret: string,
): boolean {
  if (!signature.startsWith("sha256=")) {
    return false;
  }

  const receivedSignature = signature.slice("sha256=".length);

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  if (receivedSignature.length !== expectedSignature.length) {
    return false;
  }

  return crypto.timingSafeEqual(
    Buffer.from(receivedSignature, "utf8"),
    Buffer.from(expectedSignature, "utf8"),
  );
}