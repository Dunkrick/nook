import express from "express";

import {
    getWorkspaces,
    getWorkspace,
    createWorkspace,
} from "../services/workspaces.js";

import { authenticate } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/async.js";
import { validateCreateWorkspace } from "../validation/workspaces.js";

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

export default router;