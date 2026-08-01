import * as api from "./api";

export interface Card {
    id: number;
    text: string;
    userId: number;
    x: number;
    y: number;
    createdAt: string;
    updatedAt: string;
}

export interface CardUpdate {
    text?: string;
    x?: number;
    y?: number;
}

export async function getCards(): Promise<Card[]> {
    const data = await api.get("/cards");
    return data as Card[];
}

export async function createCard({
    text,
    x,
    y
}: {
    text: string;
    x?: number;
    y?: number;
}): Promise<Card> {
    const data = await api.post("/cards", { text, x, y });
    return data as Card;
}

export async function updateCard(id: number, { text, x, y }: CardUpdate): Promise<Card> {
    const data = await api.patch(`/cards/${id}`, { text, x, y });
    return data as Card;
}

export async function deleteCard(id: number) {
    await api.del(`/cards/${id}`);
}
