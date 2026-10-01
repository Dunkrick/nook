import { Router } from "express";
import { verifyGithubWebhook } from "../middleware/github-webhooks.js";
import { publishGithubEvent } from "../queue/github-producer.js";

const router = Router();

router.post("/", verifyGithubWebhook, async (req, res) => {
  const deliveryId = req.header("X-GitHub-Delivery");
  const event = req.header("X-GitHub-Event");

  await publishGithubEvent({
    deliveryId,
    event,
    payload: req.body,
  });

  console.log("GitHub webhook received", {
    event,
    deliveryId,
  });

  res.sendStatus(200);
});

export default router;