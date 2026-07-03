export interface CreateDreamInput {
    text: string;
    userId: number;
}

export interface UpdateDreamInput {
    id: number;
    text: string;
    userId: number;
}

export interface DeleteDreamInput {
    id: number;
    userId: number;
}