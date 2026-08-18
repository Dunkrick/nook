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
            className={[
                "nook-card",
                isSelected && "nook-card--selected",
                drag.isDragging && "nook-card--dragging",
                editing.isEditing && "nook-card--editing",
            ].filter(Boolean).join(" ")}
            onPointerDown={(e) => {
                if (editing.isEditing) return; // Don't drag while editing
                drag.handlePointerDown(e);
            }}
            onPointerMove={drag.handlePointerMove}
            onPointerUp={drag.handlePointerUp}
            onPointerCancel={drag.handlePointerCancel}
            onDoubleClick={(e) => e.stopPropagation()}
            onClick={handleClick}
            style={{
                ...style,
                left: drag.position.x,
                top: drag.position.y,
            }}
        >
            {editing.isEditing ? (
                <CardEditor
                    editText={editing.editText}
                    inputRef={editing.inputRef as React.RefObject<HTMLInputElement>}
                    onTextChange={editing.setEditText}
                    onKeyDown={editing.handleKeyDown}
                    onSave={editing.handleSave}
                    onCancel={editing.handleCancel}
                />
            ) : (
                // --- NORMAL MODE ---
                <div className="nook-card__content">
                    <CardHeader
                        index={index}
                        onEdit={() => editing.setIsEditing(true)}
                        onDelete={() => onDelete(card.id)}
                    />
                    <CardBody text={card.text} />
                </div>
            )}
        </div>
    );
}
