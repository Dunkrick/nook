import express from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import type { Artifact } from "../../domain/artifacts.js";
import type { LlmClient, LlmRequest } from "../../llm/client.js";
import type { SearchHit } from "../../services/workspace-search.js";

const { searchWorkspace, createGeminiClient, getWorkspace } = vi.hoisted(() => ({
    searchWorkspace: vi.fn(),
    createGeminiClient: vi.fn(),
    getWorkspace: vi.fn(),
}));

vi.mock("../../services/workspace-search.js", async (importOriginal) => ({
    ...await importOriginal<typeof import("../../services/workspace-search.js")>(),
    searchWorkspace,
}));
vi.mock("../../services/workspaces.js", async (importOriginal) => ({
    ...await importOriginal<typeof import("../../services/workspaces.js")>(),
    getWorkspace,
}));
vi.mock("../../llm/gemini-client.js", () => ({ createGeminiClient }));

import { env } from "../../config/env.js";
import { errorHandler } from "../../lib/error.js";
import workspaceRouter from "../workspaces.js";

const createdAt = new Date("2026-11-18T10:00:00.000Z");

function makeHit(id = 12): SearchHit {
    const artifact: Artifact = {
        id,
        userId: 5,
        workspaceId: 10,
        type: "TEXT",
        content: { text: "The staging deploy completed." },
        x: 0,
        y: 0,
        zIndex: 0,
        tint: null,
        createdAt,
        updatedAt: createdAt,
    };
    return { artifact, score: 1, matchedTerms: ["deploy"] };
}

function buildApp() {
    const app = express();
    app.use(express.json());
    app.use("/workspaces", workspaceRouter);
    app.use(errorHandler);
    return app;
}

function authHeader() {
    const token = jwt.sign({ userId: 5 }, env.JWT_SECRET);
    return { Authorization: `Bearer ${token}` };
}

const generatedAnswer = JSON.stringify({
    answer: "Staging deploy completed.",
    keyPoints: [{ title: "Deploy", summary: "Staging deploy completed." }],
    evidence: [{ artifactId: 12, reason: "Text says deploy completed." }],
});

describe("POST /workspaces/:workspaceId/ask", () => {
    let app: express.Express;
    let fakeClient: LlmClient;
    let generate: Mock<(request: LlmRequest) => Promise<string>>;

    beforeEach(() => {
        vi.clearAllMocks();
        generate = vi.fn(async (_request: LlmRequest) => generatedAnswer);
        fakeClient = { generate };
        createGeminiClient.mockReturnValue(fakeClient);
        getWorkspace.mockResolvedValue({ id: 10, ownerId: 5 });
        searchWorkspace.mockResolvedValue([makeHit()]);
        app = buildApp();
    });

    it("returns 401 before parsing workspace or searching without token", async () => {
        const res = await request(app)
            .post("/workspaces/not-an-id/ask")
            .send({ question: "deploy?" });

        expect(res.status).toBe(401);
        expect(searchWorkspace).not.toHaveBeenCalled();
        expect(createGeminiClient).not.toHaveBeenCalled();
    });

    it("returns 400 for invalid workspace id before checking body", async () => {
        const res = await request(app)
            .post("/workspaces/not-an-id/ask")
            .set(authHeader())
            .send({ question: "" });

        expect(res.status).toBe(400);
        expect(res.body.error.message).toBe("Invalid workspace ID.");
        expect(searchWorkspace).not.toHaveBeenCalled();
    });

    it.each([
        ["missing", {}],
        ["blank", { question: "   " }],
        ["not a string", { question: 42 }],
        ["over 300 characters", { question: "q".repeat(301) }],
    ])("returns 400 for %s question", async (_label, body) => {
        const res = await request(app)
            .post("/workspaces/10/ask")
            .set(authHeader())
            .send(body);

        expect(res.status).toBe(400);
        expect(searchWorkspace).not.toHaveBeenCalled();
    });

    it("returns 404 for another user's workspace", async () => {
        getWorkspace.mockResolvedValue(null);
        createGeminiClient.mockReturnValue(null);

        const res = await request(app)
            .post("/workspaces/99/ask")
            .set(authHeader())
            .send({ question: "deploy?" });

        expect(res.status).toBe(404);
        expect(res.body.error).toBe("Workspace not found");
        expect(searchWorkspace).not.toHaveBeenCalled();
        expect(generate).not.toHaveBeenCalled();
    });

    it("returns 200 with grounded answer using fake LLM", async () => {
        const res = await request(app)
            .post("/workspaces/10/ask")
            .set(authHeader())
            .send({ question: "Did I deploy staging?" });

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            answer: "Staging deploy completed.",
            keyPoints: [{ title: "Deploy", summary: "Staging deploy completed." }],
            evidence: [{ artifactId: 12, reason: "Text says deploy completed." }],
            unresolvedItems: [],
        });
        expect(searchWorkspace).toHaveBeenCalledWith(5, 10, { terms: ["deploy", "staging"] });
        expect(generate).toHaveBeenCalledTimes(1);
    });

    it("translates temporal and unfinished language into filters", async () => {
        const res = await request(app)
            .post("/workspaces/10/ask")
            .set(authHeader())
            .send({ question: "What did I work on this week?" });

        expect(res.status).toBe(200);
        expect(searchWorkspace).toHaveBeenCalledWith(5, 10, { terms: ["work"], sinceDays: 7 });
    });

    it("uses openOnly and removes intent words from keyword terms", async () => {
        const res = await request(app)
            .post("/workspaces/10/ask")
            .set(authHeader())
            .send({ question: "unfinished follow up" });

        expect(res.status).toBe(200);
        expect(searchWorkspace).toHaveBeenCalledWith(5, 10, { terms: [], openOnly: true });
    });

    it("returns 200 fixed answer and skips model when no evidence exists", async () => {
        searchWorkspace.mockResolvedValue([]);
        createGeminiClient.mockReturnValue(null);

        const res = await request(app)
            .post("/workspaces/10/ask")
            .set(authHeader())
            .send({ question: "Did I deploy staging?" });

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            answer: "I couldn't find evidence of Did I deploy staging? in your workspace.",
            keyPoints: [],
            evidence: [],
            unresolvedItems: [],
        });
        expect(generate).not.toHaveBeenCalled();
    });

    it("returns 503 for missing API key only after ownership and retrieval", async () => {
        createGeminiClient.mockReturnValue(null);

        const res = await request(app)
            .post("/workspaces/10/ask")
            .set(authHeader())
            .send({ question: "Did I deploy staging?" });

        expect(res.status).toBe(503);
        expect(res.body.error.message).toBe("Workspace answers are not configured. Set API_KEY and restart the backend.");
        expect(searchWorkspace).toHaveBeenCalledWith(5, 10, { terms: ["deploy", "staging"] });
    });

    it("returns safe 502 on provider failure and logs details server-side", async () => {
        generate.mockRejectedValue(new Error("private provider response detail"));
        const log = vi.spyOn(console, "error").mockImplementation(() => {});

        const res = await request(app)
            .post("/workspaces/10/ask")
            .set(authHeader())
            .send({ question: "Did I deploy staging?" });

        expect(res.status).toBe(502);
        expect(res.body.error.message).toBe("Could not generate an answer. Try again.");
        expect(JSON.stringify(res.body)).not.toContain("private provider response detail");
        expect(log).toHaveBeenCalled();
        log.mockRestore();
    });
});
