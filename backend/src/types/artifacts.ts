export interface CreateArtifactInput {
    text: string;
    userId: number;
    x: number;
    y: number;
}

export interface UpdateArtifactInput {
    id: number;
    text?: string;
    userId: number;
    x?: number;
    y?: number;
}

export interface DeleteArtifactInput {
    id: number;
    userId: number;
}