export interface TextArtifactContent {
    text: string;
}

export interface Artifact {
    id: number;

    userId: number;

    type: "text";

    content: TextArtifactContent;

    x: number;
    y: number;

    createdAt: Date;
    updatedAt: Date;
}