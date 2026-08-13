import { useState, useRef, useEffect } from "react";
import type { Card, CardUpdate } from "../types/cards";

interface CardProps {
    card: Card;
    index: number;
    onUpdate: (id: number, update: CardUpdate) => Promise<void>;
    onDelete: (id: number) => Promise<void>;
    style?: React.CSSProperties & { [key: `--${string}`]: string | number }
    onToggleSelection: () => void;
    isSelected: boolean;
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
                boxShadow: isDragging ? "var(--shadow-drag)" : isSelected ? "var(--shadow-hover)" : "var(--shadow-resting)",
                outline: isSelected ? "3px solid rgba(255,255,255,0.9)" : "none",
                scale: isDragging ? "1.02" : isSelected ? "1.015" : isHovered ? "1.01" : "1",
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
                        onBlur={handleSave}
                        style={{ flex: 1, padding: "var(--nook-space-3)", border: "1px solid var(--nook-border-block)", borderRadius: "var(--nook-radius-sm)", fontFamily: "var(--nook-font-sans)" }}
                    />
                </div>
            ) : (
                // --- NORMAL MODE ---
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--nook-space-2)", flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
                    <div style={{ opacity: isHovered ? 1 : 0, transition: "opacity var(--motion-settle)" }}>
                        <button
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsEditing(true);
                            }}
                            style={{
                                background: "transparent",
                                border: "none",
                                cursor: "pointer",
                                fontSize: "20px",
                                color: "rgba(42,36,56,.55)",
                            }}>
                            ⋯
                        </button>
                    </div>
                </div>
                    <p className="nook-block__label" style={{ margin: "var(--nook-space-3)", whiteSpace: "pre-wrap", lineHeight: 1.55, fontWeight: 600 }}>
                            {card.text}
                    </p>
                </div>
            )}
        </div>
    );
}
