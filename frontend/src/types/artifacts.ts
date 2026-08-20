export interface TextArtifact {
    id: number;

    type: "TEXT";

    content: {
        text: string;
    };

    x: number;
    y: number;
    zIndex: number;
}

export interface DraftArtifact {
    text: string;
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
