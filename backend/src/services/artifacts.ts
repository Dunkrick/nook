import prisma from "../prisma.js";
import { toArtifact } from "../mappers/artifact.mapper.js";
import {
    CreateArtifactInput,
    UpdateArtifactInput,
} from "../types/artifacts.js";
import { Prisma, ArtifactType } from "../generated/prisma/client.js";
import { ValidationError } from "../lib/error.js";

export async function createArtifact(
    input: CreateArtifactInput
) {
    const workspace = await prisma.workspace.findFirst({
        where: {
            id: input.workspaceId,
            ownerId: input.userId,
        },
    });

    if (!workspace) {
        throw new ValidationError(
            "Workspace not found.",
            404
        );
    }

    const content = input.type === "TEXT" ? { text: input.text } : { url: input.url };

    const row = await prisma.artifact.create({
        data: {
            type: input.type,
            content,
            userId: input.userId,
            workspaceId: input.workspaceId,
            x: input.x,
            y: input.y,
        },
    });

    return toArtifact(row);
}

export async function deleteArtifact(
    id: number,
    userId: number,
    workspaceId: number,
) {
    try {
        await prisma.artifact.delete({
            where: {
                id,
                userId,
                workspaceId,
            },
        });

        return { id };
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

export async function updateArtifact(
    input: UpdateArtifactInput
) {
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

        // TODO(v2):
        // Merge JSON instead of replacing the whole content object.
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
                workspaceId: input.workspaceId,
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