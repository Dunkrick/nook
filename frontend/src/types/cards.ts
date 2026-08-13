export interface Card {
    id: number;
    text: string;
    userId: number;
    x: number;
    y: number;
    createdAt: string;
    updatedAt: string;
}

export interface DraftCard {
    text: string;
    x: number;
    y: number;
}

export interface CardUpdate {
    text?: string;
    x?: number;
    y?: number;
}


export interface Position {
    x: number;
    y: number;
}
