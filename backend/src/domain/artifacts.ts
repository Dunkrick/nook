export interface TextArtifactContent {
    text: string;
}

export interface LinkArtifactContent {
    url: string;
}

export type ArtifactContent =
    | TextArtifactContent
    | LinkArtifactContent;

export interface Artifact {
    id: number;
    userId: number;
    type: "TEXT" | "LINK";
    content: ArtifactContent;
    x: number;
    y: number;
    zIndex: number;
    createdAt: Date;
    updatedAt: Date;
}