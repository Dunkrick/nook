import { useState, useRef } from "react";
import type { Card } from "../services/cards";
import type { CardUpdate } from "../services/cards";

interface CardProps {
    card: Card;
    index: number;
    onUpdate: (id: number, update: CardUpdate) => Promise<void>;
    onDelete: (id: number) => Promise<void>;
    style?: React.CSSProperties & { [key: `--${string}`]: string | number }
}

export default function CardComponent({ card, index, onUpdate, onDelete, style }: CardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(card.text);

    const blockColor = `var(--nook-block-${(index % 4) + 1})`;

    const handleSave = async () => {
        if (!editText.trim()) return;
        await onUpdate(card.id, { text: editText });
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditText(card.text);
        setIsEditing(false);
    };

    // Is the user currently dragging this card?
    const [isDragging, setIsDragging] = useState(false);
    // The temporary position while dragging
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    // Refs to remember where the mouse was when the drag started
    const dragStartPos = useRef({ x: 0, y: 0 });

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        if (isEditing) return; // Don't drag while editing
        setIsDragging(true);
        dragStartPos.current = { x: e.clientX, y: e.clientY };
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDragging) return;
        const dx = e.clientX - dragStartPos.current.x;
        const dy = e.clientY - dragStartPos.current.y;
        setDragOffset({ x: dx, y: dy });
    };

    const handlePointerUp = async (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDragging) return;

        setIsDragging(false);
        e.currentTarget.releasePointerCapture(e.pointerId);
        const nextPosition = {
            x: card.x + dragOffset.x,
            y: card.y + dragOffset.y,
        };

        try {
            await onUpdate(card.id, nextPosition);
        } finally {
            setDragOffset({ x: 0, y: 0 });
        }
    };

    return (
        <div 
            className="nook-block"
            onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
                        style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                background: blockColor,
                // USE translate INSTEAD OF transform:
                translate: `${dragOffset.x}px ${dragOffset.y}px`, 
                zIndex: isDragging ? 100 : 1,
                cursor: isDragging ? "grabbing" : (isEditing ? "default" : "grab"),
                // CRITICAL: disable the CSS transition while dragging so it doesn't "lag" behind your mouse
                transition: isDragging ? "none" : "translate 0.2s ease, box-shadow 0.2s ease",
                ...style
            }}>

            
            {isEditing ? (
                // --- EDITING MODE ---
                <div style={{ display: "flex", gap: "var(--nook-space-2)", width: "100%" }}>
                    <input 
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        style={{ flex: 1, padding: "var(--nook-space-2)", border: "1px solid var(--nook-border-block)", borderRadius: "var(--nook-radius-sm)", fontFamily: "var(--nook-font-sans)" }}
                    />
                    <button className="nook-button-primary" style={{ background: "var(--nook-text-on-block)", color: "var(--nook-bg)" }} onClick={handleSave}>Save</button>
                    <button onClick={handleCancel} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--nook-text-on-block)", fontWeight: "var(--nook-weight-bold)" }}>Cancel</button>
                </div>
            ) : (
                // --- NORMAL MODE ---
                <>
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--nook-space-4)" }}>
                        <span className="nook-block__number">{(index + 1).toString().padStart(2, '0')}</span>
                        <p className="nook-block__label" style={{ margin: 0 }}>
                            {card.text}
                        </p>
                    </div>
                    <div style={{ display: "flex", gap: "var(--nook-space-3)" }}>
                        <button 
                            onPointerDown={(event) => event.stopPropagation()}
                            onClick={() => setIsEditing(true)}
                            style={{ background: "transparent", border: "none", color: "var(--nook-text-on-block)", cursor: "pointer", fontWeight: "var(--nook-weight-medium)" }}>
                            Edit
                        </button>
                        <button 
                            onPointerDown={(event) => event.stopPropagation()}
                            onClick={() => onDelete(card.id)}
                            style={{ background: "transparent", border: "none", color: "var(--nook-text-on-block)", cursor: "pointer", fontWeight: "var(--nook-weight-bold)" }}>
                            Delete
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
