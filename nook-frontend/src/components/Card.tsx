import { useState } from "react";
import type { Card } from "../services/cards";

interface CardProps {
    card: Card;
    index: number;
    onUpdate: (id: number, text: string) => Promise<void>;
    onDelete: (id: number) => Promise<void>;
    style?: React.CSSProperties & { [key: `--${string}`]: string | number }
}

export default function CardComponent({ card, index, onUpdate, onDelete, style }: CardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(card.text);

    const blockColor = `var(--nook-block-${(index % 4) + 1})`;

    const handleSave = async () => {
        if (!editText.trim()) return;
        await onUpdate(card.id, editText);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditText(card.text);
        setIsEditing(false);
    };

    return (
        <div 
            className="nook-block"
            style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                background: blockColor,
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
                            onClick={() => setIsEditing(true)}
                            style={{ background: "transparent", border: "none", color: "var(--nook-text-on-block)", cursor: "pointer", fontWeight: "var(--nook-weight-medium)" }}>
                            Edit
                        </button>
                        <button 
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
