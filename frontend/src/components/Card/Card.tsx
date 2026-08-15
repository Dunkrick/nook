import { useState } from "react";
import type { Card, CardUpdate } from "../../types/cards";
import { useCardEditing } from "../../hooks/useCardEditing";
import { useCardDrag } from "../../hooks/useCardDrag";
import CardHeader from "./CardHeader";
import CardBody from "./CardBody";
import CardEditor from "./CardEditor";

interface CardProps {
    card: Card;
    index: number;
    onUpdate: (id: number, update: CardUpdate) => Promise<void>;
    onDelete: (id: number) => Promise<void>;
    style?: React.CSSProperties & { [key: `--${string}`]: string | number };
    isSelected: boolean;
    onToggleSelection: () => void;
}

export default function CardComponent({ card, index, onUpdate, onDelete, style, isSelected, onToggleSelection }: CardProps) {
    const [isHovered, setIsHovered] = useState(false);

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

    const blockColor = `var(--nook-block-${(index % 4) + 1})`;

    function handleClick(e: React.MouseEvent<HTMLDivElement>) {
        // Only select when Cmd (Mac) or Ctrl (Windows/Linux) is held
        if (!e.metaKey && !e.ctrlKey) return;
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
            onPointerDown={(e) => {
                if (editing.isEditing) return; // Don't drag while editing
                drag.handlePointerDown(e);
            }}
            onPointerMove={drag.handlePointerMove}
            onPointerUp={drag.handlePointerUp}
            onDoubleClick={(e) => e.stopPropagation()}
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                display: "flex",
                justifyContent: "space-between",
                background: blockColor,
                boxShadow: isSelected || drag.isDragging ? "var(--shadow-drag)" : undefined,
                outline: isSelected ? "3px solid rgba(255,255,255,0.9)" : "none",
                scale: isSelected ? "1.03" : "1",
                zIndex: drag.isDragging ? 100 : isSelected ? 50 : 1,
                cursor: drag.isDragging ? "grabbing" : (editing.isEditing ? "default" : "grab"),
                transition: drag.isDragging ? "none" : `translate var(--motion-settle), box-shadow var(--motion-settle), scale var(--motion-settle), outline-color var(--motion-settle)`,
                ...style,
                left: drag.position.x,
                top: drag.position.y,
            }}
        >
            {editing.isEditing ? (
                <CardEditor
                    editText={editing.editText}
                    inputRef={editing.inputRef}
                    onTextChange={editing.setEditText}
                    onKeyDown={editing.handleKeyDown}
                    onSave={editing.handleSave}
                    onCancel={editing.handleCancel}
                />
            ) : (
                // --- NORMAL MODE ---
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <CardHeader
                        index={index}
                        isHovered={isHovered}
                        onEdit={() => editing.setIsEditing(true)}
                        onDelete={() => onDelete(card.id)}
                    />
                    <CardBody text={card.text} />
                </div>
            )}
        </div>
    );
}
