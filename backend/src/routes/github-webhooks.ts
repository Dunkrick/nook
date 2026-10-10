import { Router } from "express";
import { verifyGithubWebhook } from "../middleware/github-webhooks.js";
import { publishGithubEvent } from "../queue/github-producer.js";

const router = Router();

router.post("/", verifyGithubWebhook, async (req, res) => {
  const deliveryId = req.header("X-GitHub-Delivery");
  const event = req.header("X-GitHub-Event");

  // This should theoretically be caught by the middleware, but as a safeguard:
  if (!deliveryId || !event) {
    res.status(400).json({
      error: "Missing required GitHub webhook headers",
    });
    return;
  }

  let payload: unknown;

  try {
    payload = JSON.parse(req.body.toString("utf8"));
  } catch {
    res.status(400).json({
      error: "Invalid JSON payload",
    });
    return;
  }

  await publishGithubEvent({
    deliveryId,
    event,
    payload,
  });

  console.log("GitHub webhook received", {
    event,
    deliveryId,
  });

  res.sendStatus(200);
});

export default router;