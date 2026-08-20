import type { Artifact } from "../domain/artifact.js";

export function mapCardToArtifact(card: {
    id: number;
    userId: number;
    text: string;
    x: number;
    y: number;
    createdAt: Date;
    updatedAt: Date;
}): Artifact {
    return {
        id: card.id,
        userId: card.userId,

        type: "text",

        content: {
            text: card.text,
        },

        x: card.x,
        y: card.y,

        createdAt: card.createdAt,
        updatedAt: card.updatedAt,
    };
}