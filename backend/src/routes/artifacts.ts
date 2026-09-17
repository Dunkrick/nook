import { Router } from "express";

import { authenticate } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/async.js";
import { getArtifactImageUrl } from "../services/artifact-images.js";
import { GoogleCloudStorage } from "../storage/google-cloud-storage.js";
import { ValidationError } from "../lib/error.js";
import { env } from "../config/env.js";

const router = Router();

const storage = new GoogleCloudStorage(env.GCS_BUCKET_NAME);

/**
 * GET /artifacts/:id/image
 *
 * Authenticates the request, verifies ownership, then redirects the browser
 * to a short-lived signed GCS URL. Cloud Run never proxies image bytes.
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

        res.redirect(302, signedUrl);
    }),
);

export default router;
