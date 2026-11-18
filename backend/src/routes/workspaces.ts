import express from "express";

import {
    getWorkspaces,
    getWorkspace,
    createWorkspace,
    updateWorkspace,
    getWorkspaceArtifacts
} from "../services/workspaces.js";
import { createArtifact, updateArtifact, deleteArtifact } from "../services/artifacts.js";

import { authenticate } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/async.js";
import { parseWorkspaceId, validateCreateWorkspace, validateUpdateWorkspace } from "../validation/workspaces.js";
import { validateCreateArtifact, validateUpdateArtifact } from "../validation/artifacts.js";
import { parseAskQuestion } from "../validation/ask-request.js";
import { createGeminiClient } from "../llm/gemini-client.js";
import {
    askWorkspace,
    InvalidAskResponseError,
    LlmProviderError,
    LlmUnavailableError,
} from "../services/ask-workspace.js";
import type { SearchFilters } from "../services/workspace-search.js";

const QUESTION_STOPWORDS = new Set([
    "a", "an", "and", "are", "as", "at", "be", "by", "did", "do", "does",
    "for", "from", "has", "have", "how", "i", "in", "is", "it", "me", "my",
    "of", "on", "or", "our", "the", "this", "to", "was", "we", "week", "what",
    "when", "where", "which", "who", "why", "with", "you", "your", "anything",
    "related",
]);
const OPEN_INTENT_WORDS = new Set(["unfinished", "open", "follow", "up"]);

function filtersFromQuestion(question: string): SearchFilters {
    const tokens = question.toLowerCase().match(/[a-z0-9]+/g) ?? [];
    const terms = [...new Set(tokens.filter((term) =>
        !QUESTION_STOPWORDS.has(term) && !OPEN_INTENT_WORDS.has(term)
    ))];
    const filters: SearchFilters = { terms };

    if (/\bthis\s+week\b/i.test(question)) filters.sinceDays = 7;
    if (/\b(?:unfinished|open|follow[\s-]?up)\b/i.test(question)) filters.openOnly = true;

    return filters;
}

const router = express.Router();

router.get(
    "/",
    authenticate,
    asyncHandler(async (req, res) => {
        const workspaces =
            await getWorkspaces(req.user.id);

        return res.status(200).json(workspaces);
    })
);

router.get(
    "/:id",
    authenticate,
    asyncHandler(async (req, res) => {
        const workspace =
            await getWorkspace(
                Number(req.params.id),
                req.user.id
            );

        if (!workspace) {
            return res.status(404).json({
                error: "Workspace not found",
            });
        }

        return res.status(200).json(workspace);
    })
);

router.post(
    "/",
    authenticate,
    validateCreateWorkspace,
    asyncHandler(async (req, res) => {
        const workspace =
            await createWorkspace(
                req.user.id,
                req.body.name
            );

        return res.status(201).json(workspace);
    })
);

router.patch(
    "/:id",
    authenticate,
    validateUpdateWorkspace,
    asyncHandler(async (req, res) => {
        const workspaceId = parseWorkspaceId(req.params.id);
        const workspace = await updateWorkspace(
            workspaceId,
            req.user.id,
            req.body.name.trim()
        );

        if (!workspace) {
            return res.status(404).json({
                error: "Workspace not found",
            });
        }

        return res.status(200).json(workspace);
    })
);

router.post(
    "/:workspaceId/ask",
    authenticate,
    asyncHandler(async (req, res) => {
        const workspaceId = parseWorkspaceId(req.params.workspaceId);
        const question = parseAskQuestion(req.body);
        const filters = filtersFromQuestion(question);

        try {
            const result = await askWorkspace(
                req.user.id,
                workspaceId,
                question,
                filters,
                createGeminiClient(),
            );

            if (result === null) {
                return res.status(404).json({
                    error: "Workspace not found",
                });
            }

            return res.status(200).json(result);
        } catch (error) {
            if (error instanceof LlmUnavailableError) {
                return res.status(503).json({
                    success: false,
                    error: {
                        message: "Workspace answers are not configured. Set API_KEY and restart the backend.",
                    },
                });
            }

            if (error instanceof LlmProviderError) {
                console.error("Ask workspace provider request failed", error.providerError);
                return res.status(502).json({
                    success: false,
                    error: { message: "Could not generate an answer. Try again." },
                });
            }

            if (error instanceof InvalidAskResponseError) {
                console.error("Ask workspace provider returned invalid output");
                return res.status(502).json({
                    success: false,
                    error: { message: "Could not generate an answer. Try again." },
                });
            }

            throw error;
        }
    })
);

// routes/workspaces.ts

router.get(
    "/:workspaceId/artifacts",
    authenticate,
    asyncHandler(async (req, res) => {
        const workspaceId = parseWorkspaceId(req.params.workspaceId);
        const artifacts = await getWorkspaceArtifacts(
            workspaceId,
            req.user.id
        );

        if (!artifacts){
            return res.status(404).json({
                error: "Workspace not found",
            });
        }

        return res.status(200).json(artifacts);
    })
);

router.post(
    "/:workspaceId/artifacts",
    authenticate,
    validateCreateArtifact,
    asyncHandler(async (req, res) => {
        const workspaceId = parseWorkspaceId(req.params.workspaceId);

        const artifact = await createArtifact({
            ...req.body,
            userId: req.user.id,
            workspaceId,
        });

        return res.status(201).json(artifact);
    })
);

router.patch(
    "/:workspaceId/artifacts/:id",
    authenticate,
    validateUpdateArtifact,
    asyncHandler(async (req, res) => {
        const id = Number(req.params.id);
        const workspaceId = parseWorkspaceId(req.params.workspaceId);
        const updatedArtifact = await updateArtifact({ id, ...req.body, userId: req.user.id, workspaceId });

        if (!updatedArtifact) {
            return res.status(404).json({
                error: "Artifact not found",
            });
        }

        return res.status(200).json(updatedArtifact);
    })
);

router.delete(
    "/:workspaceId/artifacts/:id",
    authenticate,
    asyncHandler(async (req, res) => {
        const id = Number(req.params.id);
        const workspaceId = parseWorkspaceId(req.params.workspaceId);
        const deletedArtifact = await deleteArtifact(id, req.user.id, workspaceId);

        if (!deletedArtifact) {
            return res.status(404).json({
                error: "Artifact not found",
            });
        }

        return res.status(200).json(deletedArtifact);
    })
);

export default router;
