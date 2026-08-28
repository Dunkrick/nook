export interface TextArtifact {
    id: number;
    userId: number;
    workspaceId: number;
    type: "TEXT";

    content: {
        text: string;
    };

    x: number;
    y: number;
    zIndex: number;
}

export interface LinkArtifact {
    id: number;
    userId: number;
    workspaceId: number;
    type: "LINK";
    content: {
        url: string;
    }
    x: number;
    y: number;
    zIndex: number;
}

export type Artifact = | TextArtifact | LinkArtifact;

export interface DraftArtifact {
    type: "TEXT" | "LINK";
    text?: string;
    url?: string;
    x: number;
    y: number;
}

export interface ArtifactUpdate {
    text?: string;
    x?: number;
    y?: number;
}


export interface Position {
    x: number;
    y: number;
}
