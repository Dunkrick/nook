//this is the orchestrator as it calls useCardDrag() and userCardEditing()
//this is not a smart one, it simply composes two existing hooks
import { useCardEditing } from "../../hooks/useCardEditing";
import { useCardDrag } from "../../hooks/useCardDrag";

import type { Card, CardUpdate } from "../../types/cards";

interface UseCardInteractionProps {
    card: Card;
    onUpdate: (
        id: number,
        update: CardUpdate
    ) => Promise<void>;

    onToggleSelection: () => void;
}

export default function useCardInteraction({
    card,
    onUpdate,
    onToggleSelection,
}: UseCardInteractionProps) {

    const editing = useCardEditing({
        cardId: card.id,
        initialText: card.text,
        onUpdate,
    });

    const drag = useCardDrag({
        cardId: card.id,
        initialX: card.x,
        initialY: card.y,
        onUpdate,
    });

    function handleClick(
        e: React.MouseEvent<HTMLDivElement>
    ) {

        if (!e.metaKey && !e.ctrlKey)
            return;

        e.stopPropagation();

        onToggleSelection();
    }

    function handlePointerDown(
        e: React.PointerEvent<HTMLDivElement>
    ) {

        if (editing.isEditing)
            return;

        drag.handlePointerDown(e);

    }

    return {

        editing,

        drag,

        handleClick,

        handlePointerDown,

    };

}