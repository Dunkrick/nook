import { useState, useRef, useEffect } from "react";
import type { CardUpdate } from "../types/cards";

interface UseCardEditingOptions {
    cardId: number;
    initialText: string;
    onUpdate: (id: number, update: CardUpdate) => Promise<void>;
}

export function useCardEditing({ cardId, initialText, onUpdate }: UseCardEditingOptions) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(initialText);

    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
        }
    }, [isEditing]);

    const handleSave = async () => {
        if (!editText.trim()) return;
        await onUpdate(cardId, { text: editText });
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditText(initialText);
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSave();
            return;
        }
        if (e.key === "Escape") {
            e.preventDefault();
            handleCancel();
        }
    };

    return {
        isEditing,
        editText,
        inputRef,
        setEditText,
        setIsEditing,
        handleSave,
        handleCancel,
        handleKeyDown,
    };
}
