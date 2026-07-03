import { useState } from "react";
import type { Dream } from "../services/dreams";

interface DreamCardProps {
    dream: Dream;
    index: number;
    onUpdate: (id: number, text: string) => Promise<void>;
    onDelete: (id: number) => Promise<void>;
}

export default function DreamCard({ dream, index, onUpdate, onDelete }: DreamCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(dream.text);

    const blockColor = `var(--dw-block-${(index % 4) + 1})`;

    const handleSave = async () => {
        if (!editText.trim()) return;
        await onUpdate(dream.id, editText);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditText(dream.text);
        setIsEditing(false);
    };

    return (
        <div 
            className="dw-block"
            style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                background: blockColor
            }}>
            
            {isEditing ? (
                // --- EDITING MODE ---
                <div style={{ display: "flex", gap: "var(--dw-space-2)", width: "100%" }}>
                    <input 
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        style={{ flex: 1, padding: "var(--dw-space-2)", border: "1px solid var(--dw-border-block)", borderRadius: "var(--dw-radius-sm)", fontFamily: "var(--dw-font-sans)" }}
                    />
                    <button className="dw-button-primary" style={{ background: "var(--dw-text-on-block)", color: "var(--dw-bg)" }} onClick={handleSave}>Save</button>
                    <button onClick={handleCancel} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--dw-text-on-block)", fontWeight: "var(--dw-weight-bold)" }}>Cancel</button>
                </div>
            ) : (
                // --- NORMAL MODE ---
                <>
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--dw-space-4)" }}>
                        <span className="dw-block__number">{(index + 1).toString().padStart(2, '0')}</span>
                        <p className="dw-block__label" style={{ margin: 0 }}>
                            {dream.text}
                        </p>
                    </div>
                    <div style={{ display: "flex", gap: "var(--dw-space-3)" }}>
                        <button 
                            onClick={() => setIsEditing(true)}
                            style={{ background: "transparent", border: "none", color: "var(--dw-text-on-block)", cursor: "pointer", fontWeight: "var(--dw-weight-medium)" }}>
                            Edit
                        </button>
                        <button 
                            onClick={() => onDelete(dream.id)}
                            style={{ background: "transparent", border: "none", color: "var(--dw-text-on-block)", cursor: "pointer", fontWeight: "var(--dw-weight-bold)" }}>
                            Delete
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
