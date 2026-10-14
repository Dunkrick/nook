import { useState, useRef, useEffect } from "react";
import type { ArtifactUpdate } from "../types/artifacts";

interface UseArtifactEditingOptions {
    artifactId: number;
    initialText: string;

    isEditing: boolean;

    onUpdate: (
        id: number,
        update: ArtifactUpdate
    ) => Promise<void>;

    onEditingChange: (isEditing: boolean) => void;
}

export function useArtifactEditing({
    artifactId,
    initialText,
    isEditing,
    onUpdate,
    onEditingChange,
}: UseArtifactEditingOptions) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [editText, setEditText] = useState(initialText);

    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
        }
    }, [isEditing]);

    const startEditing = () => {
        setEditText(initialText);
        onEditingChange(true);
    };

    const stopEditing = () => {
        onEditingChange(false);
    };

    const handleSave = async () => {
        if (!editText.trim()) return;

        await onUpdate(artifactId, {
            text: editText,
        });

        stopEditing();
    };

    const handleCancel = () => {
        setEditText(initialText);
        stopEditing();
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

    const displayedText = isEditing ? editText : initialText;

    return {
        isEditing,
        editText: displayedText,
        inputRef,

        setEditText,
        startEditing,

        handleSave,
        handleCancel,
        handleKeyDown,
    };
}
