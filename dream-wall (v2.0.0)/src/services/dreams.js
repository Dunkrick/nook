//The expert of dreams
import pool from "../postgres.js";

export async function createDream(dreamText) {
    const result = await pool.query(
        `INSERT INTO dreams (text)
         VALUES ($1)
         RETURNING id, text`,
        [dreamText]
    );
    return result.rows[0];
};

export async function getAllDreams() {
    const result = await pool.query(
        `SELECT * FROM dreams ORDER BY created_at DESC`
    );
    return result.rows;
}

export async function deleteDream(id) {
    const result = await pool.query(
        `DELETE FROM dreams
         WHERE id = $1
         RETURNING id`,
        [id]
    );
    if (result.rowCount === 0) {
        return null;
    }
    return result.rows[0];
}

export async function updateDream(id, dreamText) {
    const result = await pool.query(
        `UPDATE dreams
         SET text = $2
         WHERE id = $1
         RETURNING id, text`,
        [id, dreamText]
    );
    if (result.rowCount === 0) {
        return null;
    }
    return result.rows[0];
}