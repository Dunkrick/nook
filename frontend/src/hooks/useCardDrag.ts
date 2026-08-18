import { useState, useRef } from "react";
import type { CardUpdate } from "../types/cards";

interface UseCardDragOptions {
    cardId: number;
    initialX: number;
    initialY: number;
    onUpdate: (id: number, update: CardUpdate) => Promise<void>;
}

export function useCardDrag({ cardId, initialX, initialY, onUpdate }: UseCardDragOptions) {
    const [dragPosition, setDragPosition] = useState({ x: initialX, y: initialY });
    const [isDragging, setIsDragging] = useState(false);
    const positionRef = useRef(dragPosition);
    const dragStartPos = useRef({ x: 0, y: 0 });
    const dragStartCardPos = useRef({ x: 0, y: 0 });

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        const startPosition = { x: initialX, y: initialY };
        setIsDragging(true);
        dragStartPos.current = { x: e.clientX, y: e.clientY };
        dragStartCardPos.current = startPosition;
        positionRef.current = startPosition;
        setDragPosition(startPosition);
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDragging) return;
        const dx = e.clientX - dragStartPos.current.x;
        const dy = e.clientY - dragStartPos.current.y;
        const nextPosition = {
            x: dragStartCardPos.current.x + dx,
            y: dragStartCardPos.current.y + dy,
        };
        positionRef.current = nextPosition;
        setDragPosition(nextPosition);
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDragging) return;
        setIsDragging(false);
        e.currentTarget.releasePointerCapture(e.pointerId);
        // Fire-and-forget because Home is optimistic now
        void onUpdate(cardId, positionRef.current);
    };

    const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDragging) return;
        setIsDragging(false);
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId);
        }
        void onUpdate(cardId, positionRef.current);
    };

    return {
        position: isDragging ? dragPosition : { x: initialX, y: initialY },
        isDragging,
        handlePointerDown,
        handlePointerMove,
        handlePointerUp,
        handlePointerCancel,
    };
}
