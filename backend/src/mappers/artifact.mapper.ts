import type { Artifact } from "../domain/artifact.js";

export function toArtifact(record: any): Artifact {
    return {
        id: record.id,

        userId: record.userId,

        type: record.type,

        content: record.content,

        x: record.x,

        y: record.y,

        createdAt: record.createdAt,

        updatedAt: record.updatedAt,
    };
}