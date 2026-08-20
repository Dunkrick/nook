import type {
    Artifact,
    TextArtifactContent,
} from "../domain/artifacts.js";

import type {
    Artifact as PrismaArtifact,
} from "@prisma/client";

import { ArtifactType } from "@prisma/client";

export function toArtifact(
    record: PrismaArtifact
): Artifact {
    return {
        id: record.id,

        userId: record.userId,

        type: ArtifactType.TEXT,

        // TODO(v2):
        // Validate JSON content before casting.
        content:
            record.content as unknown as TextArtifactContent,

        x: record.x,
        y: record.y,

        zIndex: record.zIndex,

        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
    };
}