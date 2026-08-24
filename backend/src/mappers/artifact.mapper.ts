import type {
    Artifact,
    TextArtifactContent,
    LinkArtifactContent,
} from "../domain/artifacts.js";

import type {
    Artifact as PrismaArtifact,
} from "@prisma/client";

import { ArtifactType } from "@prisma/client";

export function toArtifact(
    record: PrismaArtifact
): Artifact {
    let content: TextArtifactContent | LinkArtifactContent;

    if (record.type === ArtifactType.TEXT) {
        content =
            record.content as unknown as TextArtifactContent;
    } else {
        content =
            record.content as unknown as LinkArtifactContent;
    }

    return {
        id: record.id,
        userId: record.userId,
        type: record.type,
        content,
        x: record.x,
        y: record.y,
        zIndex: record.zIndex,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
    };
}