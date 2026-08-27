import express from "express";
import { createArtifact, getArtifacts, deleteArtifact, updateArtifact } from "../services/artifacts.js";
import { validateCreateArtifact, validateUpdateArtifact } from "../validation/artifacts.js";
import { authenticate } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/async.js";

const router = express.Router();
/**
 * Artifact API
 *
 * Phase 1:
 * Supports text artifacts.
 *
 * Future:
 * Images
 * Links
 * Quotes
 * Documents
 */

router.get("/", (_, res) => {
    res.json({
        service: "Nook API",
        status: "ok",
    });
});

router.get("/artifacts", authenticate, asyncHandler(async (req, res) => {
    const artifacts = await getArtifacts(req.user.id);
    res.status(200).json(artifacts);
}));

router.delete(
    "/artifacts/:id",
    authenticate,
    asyncHandler(async (req, res) => {
        const id = Number(req.params.id);
        const deletedArtifact = await deleteArtifact(id, req.user.id);

        if (!deletedArtifact) {
            return res.status(404).json({
                error: "Artifact not found",
            });
        }

        return res.status(200).json(deletedArtifact);
    })
);

router.patch(
    "/artifacts/:id",
    authenticate,
    validateUpdateArtifact,
    asyncHandler(async (req, res) => {
        const id = Number(req.params.id);
        const updatedArtifact = await updateArtifact({ id, ...req.body, userId: req.user.id });

        if (!updatedArtifact) {
            return res.status(404).json({
                error: "Artifact not found",
            });
        }

        return res.status(200).json(updatedArtifact);
    })
);

export default router;