import express from "express";
import { createDream, getAllDreams, deleteDream, updateDream } from "../services/dreams.js";
import { validateDream } from "../validation/dreams.js";
import { authenticate } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/async.js";

const router = express.Router();


router.get("/", (_, res) => {
    res.send("Hello, from the Dream Wall!");
});

router.get("/dreams", authenticate, asyncHandler(async (req, res) => {
    const dreams = await getAllDreams(req.user.id);
    res.status(200).json(dreams);
}));

router.post(
    "/dreams",
    authenticate,
    validateDream,
    asyncHandler(async (req, res) => {
        const result = await createDream({
            text: req.body.dream,
            userId: req.user.id,
        });

        return res.status(201).json(result);
    })
);

router.delete(
    "/dreams/:id",
    authenticate,
    asyncHandler(async (req, res) => {
        const id = Number(req.params.id);
        const deletedDream = await deleteDream(id, req.user.id);

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
        const updatedDream = await updateDream(id, req.body.dream, req.user.id);

        if (!updatedDream) {
            return res.status(404).json({
                error: "Dream not found",
            });
        }

        return res.status(200).json(updatedDream);
    })
);

export default router;