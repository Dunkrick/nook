export interface TextArtifactContent {
    text: string;
}

export interface LinkArtifactContent {
    url: string;
}

export interface PolaroidArtifactContent {
    imageKey: string;
}

export interface GithubIssueArtifactContent {
    source: string;
    repository: string;
    issueNumber: number;
    title: string;
    body: string;
    state: "open" | "closed" | "completed" | "not-planned";
    url: string;
    author: string;
}

export type ArtifactContent =
    | TextArtifactContent
    | LinkArtifactContent
    | PolaroidArtifactContent
    | GithubIssueArtifactContent;

export type ArtifactType =
    | "TEXT"
    | "LINK"
    | "POLAROID"
    | "GITHUB_ISSUE";

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