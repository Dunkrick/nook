import * as api from "../services/api";

export interface Dream {
    id: number;
    text: string;
    userId: number;
    createdAt: string;
    updatedAt: string;
}

export async function getDreams() {
    const data = await api.get("/dreams");
    return data as Dream[];
}

export async function createDream(text: string) {
    const data = await api.post("/dreams", { dream: text });
    return data as Dream;
}

export async function updateDream(id: number, text: string) {
    const data = await api.patch(`/dreams/${id}`, { dream: text });
    return data as Dream;
}

export async function deleteDream(id: number) {
    await api.del(`/dreams/${id}`);
}