import * as api from "./api";

export interface Card {
    id: number;
    text: string;
    userId: number;
    createdAt: string;
    updatedAt: string;
}

export async function getCards(): Promise<Card[]> {
    const data = await api.get("/dreams");
    return data as Card[];
}

export async function createCard(text: string): Promise<Card> {
    const data = await api.post("/dreams", { dream: text });
    return data as Card;
}

export async function updateCard(id: number, text: string): Promise<Card> {
    const data = await api.patch(`/dreams/${id}`, { dream: text });
    return data as Card;
}

export async function deleteCard(id: number) {
    await api.del(`/dreams/${id}`);
}