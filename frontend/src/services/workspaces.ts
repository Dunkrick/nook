import { get, post, patch, del } from "./api";
import type { Artifact, ArtifactUpdate } from "../types/artifacts";

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

export async function getWorkspaceArtifacts(workspaceId: number) {
    return get(`/workspaces/${workspaceId}/artifacts`);
}

export async function createArtifact(
    workspaceId: number,
    payload: {
        type?: "TEXT" | "LINK";
        text?: string;
        url?: string;
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
    { text, x, y }: ArtifactUpdate
): Promise<Artifact> {
    return patch(
        `/workspaces/${workspaceId}/artifacts/${id}`,
        { text, x, y }
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