export type CreateArtifactInput =
    | {
        type: "TEXT";
        text: string;
        userId: number;
        workspaceId: number;
        x: number;
        y: number;
    }
    | {
        type: "LINK";
        url: string;
        userId: number;
        workspaceId: number;
        x: number;
        y: number;
    };

export interface UpdateArtifactInput {
    id: number;
    userId: number;
    workspaceId: number;
    text?: string;
    x?: number;
    y?: number;
}

export interface DeleteArtifactInput {
    id: number;
    userId: number;
}