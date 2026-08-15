import { useState, useRef, useEffect } from "react";
import type { CardUpdate } from "../types/cards";

interface UseCardDragOptions {
    cardId: number;
    initialX: number;
    initialY: number;
    onUpdate: (id: number, update: CardUpdate) => Promise<void>;
}

export function useCardDrag({ cardId, initialX, initialY, onUpdate }: UseCardDragOptions) {
    const [position, setPosition] = useState({ x: initialX, y: initialY });
    const [isDragging, setIsDragging] = useState(false);
    const dragStartPos = useRef({ x: 0, y: 0 });
    const dragStartCardPos = useRef({ x: 0, y: 0 });

    // Keep position in sync with server-pushed updates, but not while dragging
    useEffect(() => {
        if (isDragging) return;
        setPosition({ x: initialX, y: initialY });
    }, [initialX, initialY, isDragging]);

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        setIsDragging(true);
        dragStartPos.current = { x: e.clientX, y: e.clientY };
        dragStartCardPos.current = { x: position.x, y: position.y };
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDragging) return;
        const dx = e.clientX - dragStartPos.current.x;
        const dy = e.clientY - dragStartPos.current.y;
        setPosition({
            x: dragStartCardPos.current.x + dx,
            y: dragStartCardPos.current.y + dy,
        });
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDragging) return;
        setIsDragging(false);
        e.currentTarget.releasePointerCapture(e.pointerId);
        // Fire-and-forget because Home is optimistic now
        void onUpdate(cardId, { x: position.x, y: position.y });
    };

    return {
        position,
        isDragging,
        handlePointerDown,
        handlePointerMove,
        handlePointerUp,
    };
}
