export interface TextArtifactContent {
    text: string;
}

export interface LinkArtifactContent {
    url: string;
}

export interface PolaroidArtifactContent {
    imageKey: string;
}

export type ArtifactContent =
    | TextArtifactContent
    | LinkArtifactContent
    | PolaroidArtifactContent;

export type ArtifactType =
    | "TEXT"
    | "LINK"
    | "POLAROID";

export interface Artifact {
    id: number;
    userId: number;
    workspaceId: number;
    type: ArtifactType;
    content: ArtifactContent;
    x: number;
    y: number;
    zIndex: number;
    createdAt: Date;
    updatedAt: Date;
}