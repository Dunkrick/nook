import * as api from "./api";
import type { TextArtifact, ArtifactUpdate } from "../types/artifacts";

export async function getArtifacts(): Promise<TextArtifact[]> {
    const data = await api.get("/artifacts");
    return data as TextArtifact[];
}

export async function createArtifact({
    text,
    x,
    y
}: {
    text: string;
    x?: number;
    y?: number;
}): Promise<TextArtifact> {
    const data = await api.post("/artifacts", { text, x, y });
    return data as TextArtifact;
}

export async function updateArtifact(id: number, { text, x, y }: ArtifactUpdate): Promise<TextArtifact> {
    const data = await api.patch(`/artifacts/${id}`, { text, x, y });
    return data as TextArtifact;
}

export async function deleteArtifact(id: number) {
    await api.del(`/artifacts/${id}`);
}
