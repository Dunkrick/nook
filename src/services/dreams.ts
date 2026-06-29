//The expert of dreams
import prisma from "../prisma.js";
import { CreateDreamInput } from "../types/dreams.js";
import { Prisma } from "@prisma/client";

export async function createDream(input: CreateDreamInput) {
    return prisma.dream.create({
        data: {
            text: input.text,
            userId: input.userId,
        },
        select: {
            id: true,
            text: true,
        },
    });
};

export async function getAllDreams(userId: number) {
    return prisma.dream.findMany({
        where: {
            userId,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
}

export async function deleteDream(id: number, userId: number) {
    try {
        return await prisma.dream.delete({
            where: {
                id,
                userId,
            },
            select: {
                id: true,
                text: true,
            },
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return null;
        }
        throw error;
    }
}

export async function updateDream(id: number, dreamText: string, userId: number) {
    try {
        return await prisma.dream.update({
            where: {
                id,
                userId,
            },
            data: {
                text: dreamText,
            },
            select: {
                id: true,
                text: true,
            },
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return null;
        }
        throw error;
    }
}