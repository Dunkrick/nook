import express from "express";
import { createCard, getAllCards, deleteCard, updateCard } from "../services/cards.js";
import { validateCreateCard, validateUpdateCard } from "../validation/cards.js";
import { authenticate } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/async.js";

const router = express.Router();


router.get("/", (_, res) => {
    res.send("Hello, from Nook!");
});

router.get("/cards", authenticate, asyncHandler(async (req, res) => {
    const cards = await getAllCards(req.user.id);
    res.status(200).json(cards);
}));

router.post(
    "/cards",
    authenticate,
    validateCreateCard,
    asyncHandler(async (req, res) => {
        const result = await createCard({
            text: req.body.text,
            userId: req.user.id,
            x: req.body.x,
            y: req.body.y,
        });

        return res.status(201).json(result);
    })
);

router.delete(
    "/cards/:id",
    authenticate,
    asyncHandler(async (req, res) => {
        const id = Number(req.params.id);
        const deletedCard = await deleteCard(id, req.user.id);

        if (!deletedCard) {
            return res.status(404).json({
                error: "Card not found",
            });
        }

        return res.status(200).json(deletedCard);
    })
);

router.patch(
    "/cards/:id",
    authenticate,
    validateUpdateCard,
    asyncHandler(async (req, res) => {
        const id = Number(req.params.id);
        const updatedCard = await updateCard({ id, ...req.body, userId: req.user.id });

        if (!updatedCard) {
            return res.status(404).json({
                error: "Card not found",
            });
        }

        return res.status(200).json(updatedCard);
    })
);

export default router;