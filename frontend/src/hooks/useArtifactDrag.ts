import { useState, useRef } from "react";
import type { ArtifactUpdate } from "../types/artifacts";

interface UseArtifactDragOptions {
    artifactId: number;
    initialX: number;
    initialY: number;
    zoom: number;
    onUpdate: (id: number, update: ArtifactUpdate) => Promise<void>;
}

export function useArtifactDrag({ artifactId, initialX, initialY, zoom, onUpdate }: UseArtifactDragOptions) {
    const [dragPosition, setDragPosition] = useState({ x: initialX, y: initialY });
    const [isDragging, setIsDragging] = useState(false);
    const positionRef = useRef(dragPosition);
    const dragStartPos = useRef({ x: 0, y: 0 });
    const dragStartArtifactPos = useRef({ x: 0, y: 0 });

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        const startPosition = { x: initialX, y: initialY };
        setIsDragging(true);
        dragStartPos.current = { x: e.clientX, y: e.clientY };
        dragStartArtifactPos.current = startPosition;
        positionRef.current = startPosition;
        setDragPosition(startPosition);
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDragging) return;
        const dx = (e.clientX - dragStartPos.current.x) / zoom;
        const dy = (e.clientY - dragStartPos.current.y) / zoom;
        const nextPosition = {
            x: dragStartArtifactPos.current.x + dx,
            y: dragStartArtifactPos.current.y + dy,
        };
        positionRef.current = nextPosition;
        setDragPosition(nextPosition);
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDragging) return;
        setIsDragging(false);
        e.currentTarget.releasePointerCapture(e.pointerId);
        // Fire-and-forget because Home is optimistic now
        void onUpdate(artifactId, positionRef.current);
    };

    const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDragging) return;
        setIsDragging(false);
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId);
        }
        void onUpdate(artifactId, positionRef.current);
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
