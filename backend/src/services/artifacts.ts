//Card domain service
import prisma from "../prisma.js";
import { toArtifact } from "../mappers/artifact.mapper.js";
import { CreateArtifactInput, UpdateArtifactInput } from "../types/artifacts.js";
import { Prisma } from "@prisma/client";

export async function createArtifacts(
    input: CreateArtifactInput
) {
    const row = await prisma.artifact.create({
        data: {
            type: "text",
            content: {
                text: input.text,
            },
            userId: input.userId,
            x: input.x,
            y: input.y,
        },
    });

    return toArtifact(row);
}

export async function getArtifacts(
    userId: number
) {
    const rows = await prisma.artifact.findMany({
        where: {
            userId,
        },
        orderBy: {
            createdAt: "desc"
        }
    });

    return rows.map(toArtifact);
}

export async function deleteArtifacts(
    id: number,
    userId: number
) {
    try {
        return await prisma.artifact.delete({
            where: {
                id,
                userId,
            },
            select: {
                id: true,
                content: true,
            },
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return null;
        }
        throw error;
    }
}

export async function updateArtifacts(input: UpdateArtifactInput) {
    const data: {
        content?: {
            text: string;
        };
        x?: number;
        y?: number;
    } = {};

    if (input.text !== undefined) {
        data.content = {
            text: input.text,
        };
    }

    if (input.x !== undefined) {
        data.x = input.x;
    }

    if (input.y !== undefined) {
        data.y = input.y;
    }

    try {
        const row = await prisma.artifact.update({
            where: {
                id: input.id,
                userId: input.userId,
            },
            data,
        });
        return toArtifact(row);
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
