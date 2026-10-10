import { vi, describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import { publishGithubEvent } from "../../queue/github-producer.js";
import router from "../../routes/github-webhooks.js";

// Mock the producer so we never touch real RabbitMQ
vi.mock("../../queue/github-producer.js", () => ({
  publishGithubEvent: vi.fn(),
}));

// Mock the signature middleware so we can focus on the route logic,
// not the HMAC verification. Middleware tests live in github-webhooks.test.ts.
vi.mock("../../middleware/github-webhooks.js", () => ({
  verifyGithubWebhook: vi.fn((_req, _res, next) => next()),
}));

// Build a minimal Express app that mounts only the route under test.
// We use express.raw() because that's exactly how app.ts mounts this route.
function buildApp() {
  const app = express();
  app.use(express.raw({ type: "application/json" }));
  app.use("/webhooks/github", router);
  return app;
}

// A helper to build a valid raw body string (mimics what GitHub sends over the wire)
const validPayloadStr = JSON.stringify({ action: "opened" });

describe("POST /webhooks/github", () => {
  let app: express.Express;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(publishGithubEvent).mockResolvedValue(undefined);
    app = buildApp();
  });

  it("Missing X-GitHub-Delivery → 400, nothing published", async () => {
    const res = await request(app)
      .post("/webhooks/github")
      .set("Content-Type", "application/json")
      .set("X-GitHub-Event", "push")
      // intentionally omitting X-GitHub-Delivery
      .send(validPayloadStr);

    expect(res.status).toBe(400);
    expect(publishGithubEvent).not.toHaveBeenCalled();
  });

  it("Missing X-GitHub-Event → 400, nothing published", async () => {
    const res = await request(app)
      .post("/webhooks/github")
      .set("Content-Type", "application/json")
      .set("X-GitHub-Delivery", "abc-123")
      // intentionally omitting X-GitHub-Event
      .send(validPayloadStr);

    expect(res.status).toBe(400);
    expect(publishGithubEvent).not.toHaveBeenCalled();
  });

  it("Invalid JSON body → 400, nothing published", async () => {
    const res = await request(app)
      .post("/webhooks/github")
      .set("Content-Type", "application/json")
      .set("X-GitHub-Delivery", "abc-123")
      .set("X-GitHub-Event", "push")
      // send a raw string that is not valid JSON
      .send("this is not valid json {");

    expect(res.status).toBe(400);
    expect(publishGithubEvent).not.toHaveBeenCalled();
  });

  it("Valid request → publishGithubEvent called and returns 200 after confirmation", async () => {
    const res = await request(app)
      .post("/webhooks/github")
      .set("Content-Type", "application/json")
      .set("X-GitHub-Delivery", "abc-123")
      .set("X-GitHub-Event", "push")
      .send(validPayloadStr);

    expect(publishGithubEvent).toHaveBeenCalledWith({
      deliveryId: "abc-123",
      event: "push",
      payload: { action: "opened" },
    });
    expect(res.status).toBe(200);
  });

  it("Publish failure → no 200 returned", async () => {
    vi.mocked(publishGithubEvent).mockRejectedValue(
      new Error("RabbitMQ confirms failed")
    );

    // Express 5 propagates async errors to the error handler,
    // which results in a 500 — importantly, NOT a 200.
    const res = await request(app)
      .post("/webhooks/github")
      .set("Content-Type", "application/json")
      .set("X-GitHub-Delivery", "abc-123")
      .set("X-GitHub-Event", "push")
      .send(validPayloadStr);

    expect(res.status).not.toBe(200);
  });
});
