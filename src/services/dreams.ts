//The expert of dreams
import prisma from "../prisma.js";

export async function createDream(dreamText: string) {
    return prisma.dreams.create({
        data: {
            text: dreamText,
        },
        select: {
            id: true,
            text: true,
        },
    });
};

export async function getAllDreams() {
    return prisma.dreams.findMany({
        select: {
            id: true,
            text: true,
        },
        orderBy: {
            created_at: "desc",
        },
    });
}

export async function deleteDream(id: number) {
    return prisma.dreams.delete({
        where: {
            id: id,
        },
        select: {
            id: true,
            text: true,
        },
    })
}

export async function updateDream(id: number, dreamText: string) {
    return prisma.dreams.update({
        where: {
            id: id,
        },
        data: {
            text: dreamText,
        },
        select: {
            id: true,
            text: true,
        },
    });
}