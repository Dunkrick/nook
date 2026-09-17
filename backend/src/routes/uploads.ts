import { Router } from "express";
import multer from "multer";

import { authenticate } from "../middleware/auth.js";
import { uploadImage } from "../services/uploads.js";
import { GoogleCloudStorage } from "../storage/google-cloud-storage.js";
import { env } from "../config/env.js";

const router = Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
});

const storage = new GoogleCloudStorage(env.GCS_BUCKET_NAME);

router.post(
    "/",
    authenticate,
    upload.single("file"),
    async (req, res, next) => {
        try {
            if (!req.file) {
                res.status(400).json({
                    success: false,
                    error: {
                        message: "No file provided.",
                        code: "FILE_REQUIRED",
                    },
                });
                return;
            }

            const result = await uploadImage(
                {
                    buffer: req.file.buffer,
                    originalName: req.file.originalname,
                    contentType: req.file.mimetype,
                    size: req.file.size,
                },
                storage,
                req.user.id,
            );

            res.status(201).json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    },
);

export default router;