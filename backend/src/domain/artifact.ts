export type ArtifactType = "text";

export interface Artifact {
    id: number;
    userId: number;

    type: ArtifactType;

    content: {
        text: string;
    };

    x: number;
    y: number;

    createdAt: Date;
    updatedAt: Date;
}