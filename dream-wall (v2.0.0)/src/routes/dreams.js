import express from "express";
import { createDream, getAllDreams, deleteDream, updateDream } from "../services/dreams.js";

const router = express.Router();


router.get("/", (_, res) => {
    res.send("Hello, from the Dream Wall!");
});

//succesfully migrated to postgres and TypeScript, is now working
router.get("/dreams", async (_, res) => {
    try {
        const dreams = await getAllDreams();
        res.status(200).json(dreams);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({
                error: error.message,
            });
        }

        res.status(500).json({
            error: "Unknown error",
        });
    }
});

//succesfully migrated to postgres and TypeScript, is now working
router.post("/dreams", async (req, res) => {
    const dreamText = req.body.dream?.trim();
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
        if (error instanceof Error) {
            return res.status(500).json({
                error: error.message,
            });
        }
        return res.status(500).json({
            error: "Unknown error",
        });
    }
});

//succesfully migrated to postgres and TypeScript, is now working
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
        if (error instanceof Error) {
            return res.status(500).json({
                error: error.message
            });
        }
        return res.status(500).json({
            error: "Unknown error"
        });
    }

});

//endpoint for updating a dream - previously didn't implement in v1
router.patch("/dreams/:id", async (req, res) => {
    const id = req.params.id;
    const dreamText = req.body.dream?.trim();

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
        if (error instanceof Error) {
            return res.status(500).json({
                error: error.message
            });
        }
        return res.status(500).json({
            error: "Unknown error"
        });
    }
});

export default router;