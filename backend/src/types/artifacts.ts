export interface CreateArtifactInput {
    text: string;
    userId: number;
    x: number;
    y: number;
    workspaceId: number;
}

export interface UpdateArtifactInput {
    id: number;
    userId: number;
    text?: string;
    x?: number;
    y?: number;
}

export interface DeleteArtifactInput {
    id: number;
    userId: number;
}