import { Router } from "express";

import { authenticate } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/async.js";
import { getArtifactImageUrl } from "../services/artifact-images.js";
import { getObjectStorage } from "../storage/storage-factory.js";
import { ValidationError } from "../lib/error.js";

const router = Router();

const storage = getObjectStorage();

/**
 * GET /artifacts/:id/image
 *
 * Authenticates the request, verifies ownership, then returns a short-lived
 * signed GCS URL as JSON. Cloud Run never proxies image bytes.
 */
router.get(
    "/:id/image",
    authenticate,
    asyncHandler(async (req, res) => {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            throw new ValidationError("Invalid artifact ID.", 400);
        }

        const signedUrl = await getArtifactImageUrl(id, req.user.id, storage);

        res.status(200).json({ url: signedUrl });
    }),
);

export default router;
