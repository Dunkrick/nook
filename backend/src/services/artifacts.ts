import prisma from "../prisma.js";
import { toArtifact } from "../mappers/artifact.mapper.js";
import {
    CreateArtifactInput,
    UpdateArtifactInput,
} from "../types/artifacts.js";
import { Prisma, ArtifactType } from "../generated/prisma/client.js";
import { ValidationError } from "../lib/error.js";

function assertOwnedImageKey(imageKey: string, userId: number) {
    const prefix = `uploads/users/${userId}/`;

    if (!imageKey.startsWith(prefix)) {
        throw new ValidationError(
            "Image does not belong to the user.",
            403
        );
    }
}

/**
 * Copies the stored content JSON and sets or clears `caption`. Every other
 * key, `imageKey` above all, is carried over untouched.
 */
function withCaption(
    content: Prisma.JsonValue,
    caption: string
): Prisma.InputJsonObject {
    const merged: Record<string, unknown> =
        content && typeof content === "object" && !Array.isArray(content)
            ? { ...(content as Record<string, unknown>) }
            : {};

    if (caption === "") {
        delete merged.caption;
    } else {
        merged.caption = caption;
    }

    return merged as Prisma.InputJsonObject;
}

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

    if (input.type === "POLAROID") {
        assertOwnedImageKey(input.imageKey, input.userId);
    }

    const content =
        input.type === "TEXT"
            ? { text: input.text }
            : input.type === "LINK"
            ? { url: input.url }
            : {
                imageKey: input.imageKey,
                ...(input.caption ? { caption: input.caption } : {}),
            };

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
        content?: Prisma.InputJsonObject;
        x?: number;
        y?: number;
    } = {};

    if (input.text !== undefined) {
        data.content = {
            text: input.text,
        };
    }

    if (input.caption !== undefined) {
        // A caption update must keep `imageKey`, so the stored content is read
        // back and merged. A move needs no read.
        const existing = await prisma.artifact.findFirst({
            where: {
                id: input.id,
                userId: input.userId,
                workspaceId: input.workspaceId,
            },
        });

        if (!existing) {
            return null;
        }

        if (existing.type !== "POLAROID") {
            throw new ValidationError(
                "Only polaroid artifacts can have a caption."
            );
        }

        data.content = withCaption(existing.content, input.caption);
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