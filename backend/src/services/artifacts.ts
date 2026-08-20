//Card domain service
import prisma from "../prisma.js";
import { CreateCardInput, UpdateCardInput } from "../types/artifacts.js";
import { Prisma } from "@prisma/client";
export async function createCard(input: CreateCardInput) {
    return prisma.card.create({
        data: {
            text: input.text,
            userId: input.userId,
            x: input.x,
            y: input.y,
        },
    });
};

export async function getAllCards(userId: number) {
    return prisma.card.findMany({
        where: {
            userId,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
}

export async function deleteCard(id: number, userId: number) {
    try {
        return await prisma.card.delete({
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

export async function updateCard(input: UpdateCardInput) {
    const data: {
        text?: string;
        x?: number;
        y?: number;
    } = {};

    if (input.text !== undefined) {
        data.text = input.text;
    }

    if (input.x !== undefined) {
        data.x = input.x;
    }

    if (input.y !== undefined) {
        data.y = input.y;
    }

    try {
        return await prisma.card.update({
            where: {
                id: input.id,
                userId: input.userId,
            },
            data,
        });
    } catch (error) {
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2025"
        ) {
            return null;
        }

        throw error;
    }
}
