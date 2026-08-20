export interface CreateCardInput {
    text: string;
    userId: number;
    x: number;
    y: number;
}

export interface UpdateCardInput {
    id: number;
    text?: string;
    userId: number;
    x?: number;
    y?: number;
}

export interface DeleteCardInput {
    id: number;
    userId: number;
}