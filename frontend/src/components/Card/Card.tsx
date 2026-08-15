import { useState, useRef, useEffect } from "react";
import type { Card, CardUpdate } from "../../types/cards";
import CardHeader from "./CardHeader";
import CardBody from "./CardBody";

interface CardProps {
    card: Card;
    index: number;
    onUpdate: (id: number, update: CardUpdate) => Promise<void>;
    onDelete: (id: number) => Promise<void>;
    style?: React.CSSProperties & { [key: `--${string}`]: string | number }
    isSelected: boolean;
    onToggleSelection: () => void;
}

export default function CardComponent({ card, index, onUpdate, onDelete, style, isSelected, onToggleSelection }: CardProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [editText, setEditText] = useState(card.text);
    const [position, setPosition] = useState({
        x: card.x,
        y: card.y,
    });

    // Is the user currently dragging this card?
    const [isDragging, setIsDragging] = useState(false);
    // Refs to remember where the mouse was when the drag started
    const dragStartPos = useRef({ x: 0, y: 0 });
    const dragStartCardPos = useRef({ x: 0, y: 0 });

    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
        }
    }, [isEditing]);

    useEffect(() => {
        if (isDragging) {
            return;
        }
        setPosition({
            x: card.x,
            y: card.y,
        });
    }, [card.x, card.y, isDragging]);

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

    function handleKeyDown(
        e: React.KeyboardEvent<HTMLInputElement>
    ) {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSave();
            return;
        }

        if (e.key === "Escape") {
            e.preventDefault();
            handleCancel();
        }
    }

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        if (isEditing) return; // Don't drag while editing
        setIsDragging(true);
        dragStartPos.current = {
            x: e.clientX,
            y: e.clientY,
        };

        dragStartCardPos.current = {
            x: position.x,
            y: position.y,
        };
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

    const handlePointerUp = async (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDragging) return;        
        setIsDragging(false);

        e.currentTarget.releasePointerCapture(e.pointerId);

        const nextPosition = position;

        // Fire-and-forget because Home is optimistic now
        void onUpdate(card.id, nextPosition);
    };

    function handleClick(e: React.MouseEvent<HTMLDivElement>) {
        // Only select when Cmd (Mac) or Ctrl (Windows/Linux) is held
        if (!e.metaKey && !e.ctrlKey) {
            return;
        }

        e.stopPropagation();
        onToggleSelection();
    }
    // TODO(vNext):
    // Ignore click events that follow a drag.
    // This temporary Cmd/Ctrl+Click selection will be replaced
    // by rectangle selection.

    return (
        <div 
            className="nook-block"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onDoubleClick={(e) => e.stopPropagation()}
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                display: "flex",
                justifyContent: "space-between",
                background: blockColor,
                boxShadow: isSelected || isDragging ? "var(--shadow-drag)" : undefined,
                outline: isSelected ? "3px solid rgba(255,255,255,0.9)" : "none",
                scale: isSelected ? "1.03" : "1",
                zIndex: isDragging ? 100 : isSelected ? 50 : 1,
                cursor: isDragging ? "grabbing" : (isEditing ? "default" : "grab"),
                transition: isDragging ? "none" : `translate var(--motion-settle), box-shadow var(--motion-settle), scale var(--motion-settle), outline-color var(--motion-settle)`,
                ...style,
                left: position.x,
                top: position.y
            }}>
            {isEditing ? (
                // --- EDITING MODE ---
                <div style={{ display: "flex", gap: "var(--nook-space-2)", width: "100%" }}>
                    <input 
                        value={editText}
                        ref={inputRef}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        style={{ flex: 1, padding: "var(--nook-space-3)", border: "1px solid var(--nook-border-block)", borderRadius: "var(--nook-radius-sm)", fontFamily: "var(--nook-font-sans)" }}
                    />
                    <button className="nook-button-primary" style={{ background: "var(--nook-text-on-block)", color: "var(--nook-bg)" }} onClick={handleSave}>Save</button>
                    <button onClick={handleCancel} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--nook-text-on-block)", fontWeight: "var(--nook-weight-bold)" }}>Cancel</button>
                </div>
            ) : (
                // --- NORMAL MODE ---
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <CardHeader
                        index={index}
                        isHovered={isHovered}
                        onEdit={() => setIsEditing(true)}
                        onDelete={() => onDelete(card.id)}
                    />
                    <CardBody text={card.text} />
                </div>
            )}
        </div>
    );
}
