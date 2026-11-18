import { get, post, patch, del } from "./api";
import type { Artifact, ArtifactUpdate } from "../types/artifacts";

export interface AskWorkspaceResponse {
    answer: string;
    keyPoints: Array<{ title: string; summary: string }>;
    evidence: Array<{ artifactId: number; reason: string }>;
    unresolvedItems: string[];
}

export function askWorkspace(workspaceId: number, question: string): Promise<AskWorkspaceResponse> {
    return post(`/workspaces/${workspaceId}/ask`, { question });
}

export interface Workspace {
    id: number;
    name: string;
    createdAt: string;
    center?: {
        x: number;
        y: number;
    };
}

export async function getWorkspaces(): Promise<Workspace[]> {
    return get("/workspaces");
}

export async function createWorkspace(name: string): Promise<Workspace> {
    return post("/workspaces", {
        name,
    });
}

export async function updateWorkspace(workspaceId: number, name: string): Promise<Workspace> {
    return patch(`/workspaces/${workspaceId}`, {
        name,
    });
}

export async function getWorkspaceArtifacts(workspaceId: number): Promise<Artifact[]> {
    return get(`/workspaces/${workspaceId}/artifacts`);
}

export async function createArtifact(
    workspaceId: number,
    payload: {
        type?: "TEXT" | "LINK" | "POLAROID";
        text?: string;
        url?: string;
        imageKey?: string;
        caption?: string;
        x?: number;
        y?: number;
    }
): Promise<Artifact> {
    return post(
        `/workspaces/${workspaceId}/artifacts`,
        payload
    );
}

export async function updateArtifact(
    workspaceId: number,
    id: number,
    { text, caption, tint, x, y }: ArtifactUpdate
): Promise<Artifact> {
    return patch(
        `/workspaces/${workspaceId}/artifacts/${id}`,
        { text, caption, tint, x, y }
    );
}

export async function deleteArtifact(
    workspaceId: number,
    id: number
): Promise<void> {
    await del(
        `/workspaces/${workspaceId}/artifacts/${id}`
    );
}
