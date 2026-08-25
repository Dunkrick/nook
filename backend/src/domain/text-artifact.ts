import type { ArtifactType } from "../generated/prisma/client.js";

export interface TextArtifactContent {
    text: string;
}

export interface TextArtifact {
    id: number;

    userId: number;

    type: ArtifactType;

    content: TextArtifactContent;

    x: number;
    y: number;

    zIndex: number;

    createdAt: Date;
    updatedAt: Date;
}