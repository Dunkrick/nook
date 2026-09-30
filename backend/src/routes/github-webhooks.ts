import { Router } from "express";
import { verifyGithubWebhook } from "../middleware/github-webhooks.js";

const router = Router();

router.post("/", verifyGithubWebhook, (req, res) => {
  const event = req.header("X-GitHub-Event");
  const deliveryId = req.header("X-GitHub-Delivery");

  if (!event || !deliveryId) {
    return res.sendStatus(400);
  }

  console.log("GitHub webhook received", {
    event,
    deliveryId,
  });

  res.sendStatus(200);
});

export default router;