const express = require("express");
const db = require("./db");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.json());
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.send("Hello, from the Dream Wall!");
});

app.get("/dreams", (req, res) => {
    db.all("SELECT * FROM dreams", [], (err, rows) => {
        if (err) {
            return res.status(500).json({
                error: err.message,
            });
        }

        res.json(rows);
    });
});

app.post("/dreams", (req, res) => {
    const dreamText = req.body.dream?.trim();

    if (!dreamText) {
        return res.status(400).json({
            error: "Dream cannot be empty",
        });
    }

    const sql = `
    INSERT INTO dreams (text)
    VALUES (?)
  `;

    db.run(sql, [dreamText], function (err) {
        if (err) {
            return res.status(500).json({
                error: err.message,
            });
        }

        res.status(201).json({
            id: this.lastID,
            text: dreamText,
        });
    });
});

app.delete("/dreams/:id", (req, res) => {
    const id = req.params.id;

    const sql = `
    DELETE FROM dreams
    WHERE id = ?
  `;

    db.run(sql, [id], function (err) {
        if (err) {
            return res.status(500).json({
                error: err.message,
            });
        }

        if (this.changes === 0) {
            return res.status(404).json({
                error: "Dream not found",
            });
        }

        res.status(200).json({
            message: "Dream deleted",
            id: Number(id),
        });
    });
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
});