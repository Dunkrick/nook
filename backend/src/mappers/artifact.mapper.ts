import type {
    Artifact,
    ArtifactContent,
} from "../domain/artifacts.js";

import type {
    Artifact as PrismaArtifact,
} from "../generated/prisma/client.js";

export function toArtifact(
    record: PrismaArtifact
): Artifact {
    return {
        id: record.id,
        userId: record.userId,
        type: record.type,
        content: record.content as unknown as ArtifactContent,
        x: record.x,
        y: record.y,
        zIndex: record.zIndex,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
    };
}