import * as api from "./api";
import type { Card, CardUpdate } from "../types/cards";

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
