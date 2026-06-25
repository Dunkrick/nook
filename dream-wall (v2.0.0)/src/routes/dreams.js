import express from "express";
import { createDream, getAllDreams, deleteDream, updateDream } from "../services/dreams.js";
import { handleServerError } from "../lib/error.js";
import { validateDream } from "../validation/dreams.js";

const router = express.Router();


router.get("/", (_, res) => {
    res.send("Hello, from the Dream Wall!");
});

router.get("/dreams", async (_, res) => {
    try {
        const dreams = await getAllDreams();
        res.status(200).json(dreams);
    }
    catch (error) {
        return handleServerError(res, error);
    }
});

router.post("/dreams", async (req, res) => {
    const dreamText = validateDream(req.body.dream);
    if (!dreamText) {
        return res.status(400).json({
            error: "Dream cannot be empty",
        });
    }

    try {
        const result = await createDream(dreamText);
        return res.status(201).json(result);
    }
    catch (error) {
        return handleServerError(res, error);
    }
});

router.delete("/dreams/:id", async (req, res) => {
    const id = req.params.id;

    try {
        const deletedDream = await deleteDream(id);

        if (!deletedDream) {
            return res.status(404).json({
                error: "Dream not found"
            });
        }

        return res.status(200).json(deletedDream);
    }
    catch (error) {
        return handleServerError(res, error);
    }

});

router.patch("/dreams/:id", async (req, res) => {
    const id = req.params.id;
    const dreamText = validateDream(req.body.dream);

    if (!dreamText) {
        return res.status(400).json({
            error: "Dream cannot be empty",
        });
    }

    try {
        const updatedDream = await updateDream(id, dreamText);

        if (!updatedDream) {
            return res.status(404).json({
                error: "Dream not found"
            });
        }

        return res.status(200).json(updatedDream);
    }
    catch (error) {
        return handleServerError(res, error);
    }
});

export default router;