//The expert of dreams
import pool from "../postgres.js";
import prisma from "../prisma.js";

export async function createDream(dreamText) {
    return prisma.dream.create({
        data: {
            text,
        },
        select: {
            id: true,
            text: true,
        },
    });
};

export async function getAllDreams() {
    return prisma.dream.findMany({
        select: {
            id: true,
            text: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
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