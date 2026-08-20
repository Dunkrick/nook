import { useState, useRef, useEffect } from "react";
import type { ArtifactUpdate } from "../types/artifacts";

interface UseArtifactEditingOptions {
    artifactId: number;
    initialText: string;
    onUpdate: (id: number, update: ArtifactUpdate) => Promise<void>;
}

export function useArtifactEditing({ artifactId, initialText, onUpdate }: UseArtifactEditingOptions) {
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
        await onUpdate(artifactId, { text: editText });
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
