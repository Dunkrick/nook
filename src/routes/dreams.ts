import express from "express";
import { createDream, getAllDreams, deleteDream, updateDream } from "../services/dreams.js";
import { validateDream } from "../validation/dreams.js";

const router = express.Router();


router.get("/", (_, res) => {
    res.send("Hello, from the Dream Wall!");
});

router.get("/dreams", async (_, res) => {
    const dreams = await getAllDreams();
    res.status(200).json(dreams);
});

router.post("/dreams", validateDream, async (req, res) => {
    const result = await createDream(req.body.dream);
    return res.status(201).json(result);
});

router.delete("/dreams/:id", async (req, res) => {
    const id = Number(req.params.id);
    const deletedDream = await deleteDream(id);

    if (!deletedDream) {
        return res.status(404).json({
            error: "Dream not found"
        });
    }

    return res.status(200).json(deletedDream);
});

router.patch("/dreams/:id", validateDream, async (req, res) => {
    const id = Number(req.params.id);
    const updatedDream = await updateDream(id, req.body.dream);

    if (!updatedDream) {
        return res.status(404).json({
            error: "Dream not found"
        });
    }

    return res.status(200).json(updatedDream);
});

export default router;