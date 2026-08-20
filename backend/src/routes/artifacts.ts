import express from "express";
import { createArtifact, getArtifacts, deleteArtifact, updateArtifact } from "../services/artifacts.js";
import { validateCreateArtifact, validateUpdateArtifact } from "../validation/artifacts.js";
import { authenticate } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/async.js";

const router = express.Router();


router.get("/", (_, res) => {
    res.send("Hello, from Nook!");
});

router.get("/artifacts", authenticate, asyncHandler(async (req, res) => {
    const cards = await getArtifacts(req.user.id);
    res.status(200).json(cards);
}));

router.post(
    "/artifacts",
    authenticate,
    validateCreateArtifact,
    asyncHandler(async (req, res) => {
        const result = await createArtifact({
            text: req.body.text,
            userId: req.user.id,
            x: req.body.x,
            y: req.body.y,
        });

        return res.status(201).json(result);
    })
);

router.delete(
    "/artifacts/:id",
    authenticate,
    asyncHandler(async (req, res) => {
        const id = Number(req.params.id);
        const deletedCard = await deleteArtifact(id, req.user.id);

        if (!deletedCard) {
            return res.status(404).json({
                error: "Card not found",
            });
        }

        return res.status(200).json(deletedCard);
    })
);

router.patch(
    "/artifacts/:id",
    authenticate,
    validateUpdateArtifact,
    asyncHandler(async (req, res) => {
        const id = Number(req.params.id);
        const updatedCard = await updateArtifact({ id, ...req.body, userId: req.user.id });

        if (!updatedCard) {
            return res.status(404).json({
                error: "Card not found",
            });
        }

        return res.status(200).json(updatedCard);
    })
);

export default router;