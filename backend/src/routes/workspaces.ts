import express from "express";

import {
    getWorkspaces,
    getWorkspace,
    createWorkspace,
    getWorkspaceArtifacts
} from "../services/workspaces.js";
import { createArtifact } from "../services/artifacts.js";

import { authenticate } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/async.js";
import { parseWorkspaceId, validateCreateWorkspace } from "../validation/workspaces.js";
import { validateCreateArtifact } from "../validation/artifacts.js";

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

// routes/workspaces.ts

router.get(
    "/:workspaceId/artifacts",
    authenticate,
    asyncHandler(async (req, res) => {
        const workspaceId = parseWorkspaceId(req.params.workspaceId);
        const artifacts = await getWorkspaceArtifacts(
            req.user.id,
            workspaceId
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

export default router;