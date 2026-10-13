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

export interface PolaroidArtifact {
    id: number;
    userId: number;
    workspaceId: number;
    type: "POLAROID";
    content: {
        imageKey: string;
    };
    x: number;
    y: number;
    zIndex: number;
}

export interface GithubIssueArtifact {
    id: number;
    userId: number;
    workspaceId: number;
    type: "GITHUB_ISSUE";
    content: {
        repository: string;
        issueNumber: number;
        title: string;
        body: string;
        state: "open" | "closed";
        url: string;
        author: string;
    };
    x: number;
    y: number;
    zIndex: number;
}

export type Artifact = | TextArtifact | LinkArtifact | PolaroidArtifact | GithubIssueArtifact;

export interface DraftArtifact {
    type: "TEXT" | "LINK" | "POLAROID";
    text?: string;
    url?: string;
    imageKey?: string;
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
