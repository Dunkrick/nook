import express from "express";
import { createCard, getAllCards, deleteCard, updateCard } from "../services/cards.js";
import { validateDream } from "../validation/dreams.js";
import { authenticate } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/async.js";

const router = express.Router();


router.get("/", (_, res) => {
    res.send("Hello, from the Dream Wall!");
});

router.get("/dreams", authenticate, asyncHandler(async (req, res) => {
    const dreams = await getAllCards(req.user.id);
    res.status(200).json(dreams);
}));

router.post(
    "/dreams",
    authenticate,
    validateDream,
    asyncHandler(async (req, res) => {
        const result = await createCard({
            text: req.body.dream,
            userId: req.user.id,
            x: 0,
            y: 0,
        });

        return res.status(201).json(result);
    })
);

router.delete(
    "/dreams/:id",
    authenticate,
    asyncHandler(async (req, res) => {
        const id = Number(req.params.id);
        const deletedDream = await deleteCard(id, req.user.id);

        if (!deletedDream) {
            return res.status(404).json({
                error: "Dream not found",
            });
        }

        return res.status(200).json(deletedDream);
    })
);

router.patch(
    "/dreams/:id",
    authenticate,
    validateDream,
    asyncHandler(async (req, res) => {
        const id = Number(req.params.id);
        const updatedDream = await updateCard({ id, text: req.body.dream, userId: req.user.id });

        if (!updatedDream) {
            return res.status(404).json({
                error: "Dream not found",
            });
        }

        return res.status(200).json(updatedDream);
    })
);

export default router;