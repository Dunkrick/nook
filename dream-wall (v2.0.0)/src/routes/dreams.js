import express from "express";
import pool from "../postgres.js";

const router = express.Router();


router.get("/", (_, res) => {
    res.send("Hello, from the Dream Wall!");
});

//succesfully migrated to postgres and TypeScript, is now working
router.get("/dreams", async (_, res) => {

    try {
        const result = await pool.query(
            `SELECT * FROM dreams ORDER BY created_at DESC`
        );
        res.status(200).json(result.rows);
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
        const result = await pool.query(
            `INSERT INTO dreams (text)
                VALUES ($1)
                RETURNING id, text
            `, [dreamText]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({
            error: err.message,
        });
    }
});

router.delete("/dreams/:id", async (req, res) => {
    const id = req.params.id;

    try {
        const result = await pool.query(
            `DELETE FROM dreams
        WHERE id = $1
        RETURNING id`,
            [id]
        );
        res.status(200).json(result.rowCount);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(404).json({
                error: error.message
            })
        }
        return res.status(500).json({
            error: "Unknown error"
        });
    }

});

export default router;