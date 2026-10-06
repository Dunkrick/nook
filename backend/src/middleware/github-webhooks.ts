import type { NextFunction, Request, Response } from "express";

import { env } from "../config/env.js";
import { isValidGithubSignature } from "../lib/github-webhooks.js";

export function verifyGithubWebhook(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const signature = req.header("X-Hub-Signature-256");

  if (!signature) {
    return res.sendStatus(401);
  }

  if (!Buffer.isBuffer(req.body)) {
    return res.sendStatus(400);
  }

  const isValid = isValidGithubSignature(
    req.body,
    signature,
    env.GITHUB_WEBHOOK_SECRET,
  );

  if (!isValid) {
    return res.sendStatus(401);
  }

  next();
}