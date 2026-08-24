import { get, post } from "./api";

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
