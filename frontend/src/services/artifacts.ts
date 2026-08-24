import * as api from "./api";
import type { Artifact, TextArtifact, ArtifactUpdate } from "../types/artifacts";

export async function getArtifacts(): Promise<TextArtifact[]> {
    const data = await api.get("/artifacts");
    return data as TextArtifact[];
}

export async function createArtifact(payload: {
    type?: "TEXT" | "LINK";
    text?: string;
    url?: string;
    x?: number;
    y?: number;
    workspaceId: number;
}): Promise<Artifact> {
    const data = await api.post("/artifacts", payload);
    return data as Artifact;
}

export async function updateArtifact(id: number, { text, x, y }: ArtifactUpdate): Promise<TextArtifact> {
    const data = await api.patch(`/artifacts/${id}`, { text, x, y });
    return data as TextArtifact;
}

export async function deleteArtifact(id: number) {
    await api.del(`/artifacts/${id}`);
}
