//the container
import type { Card, CardUpdate } from "../../types/cards";
import CardView from "./CardView";
import useCardInteraction from "./useCardInteraction";

interface CardProps {
    card: Card;
    index: number;
    onUpdate: (
        id: number,
        update: CardUpdate
    ) => Promise<void>;
    onDelete: (
        id: number
    ) => Promise<void>;
    style?: React.CSSProperties & {
        [key: `--${string}`]:
            string | number;
    };
    isSelected: boolean;
    onToggleSelection: () => void;
}

export default function CardComponent({ card, index, onUpdate, onDelete, style, isSelected, onToggleSelection }: CardProps) {
    const interaction =
        useCardInteraction({
            card,
            onUpdate,
            onToggleSelection,
        });

    return (

        <CardView
            index={index}
            cardText={card.text}
            interaction={interaction}
            isSelected={isSelected}
            style={style}
            onDelete={() => onDelete(card.id)}
        />
    );
}
