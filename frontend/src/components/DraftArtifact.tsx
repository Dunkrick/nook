import { useEffect, useRef, useState } from "react";
import type { Position } from "../types/artifacts";

interface DraftArtifactProps {
    position: Position;
    onCommit: (text: string) => Promise<void>;
    onCancel: () => void;
}

export default function DraftArtifactComponent({
    position,
    onCommit,
    onCancel,
}: DraftArtifactProps) {

    const [text, setText] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
      textareaRef.current?.focus();  
    }, []);

    async function handleKeyDown(
        e: React.KeyboardEvent<HTMLTextAreaElement>
    ) {
        if (e.key === "Enter" && e.shiftKey) {
            return;
        }
        if (e.key === "Escape") {
            e.preventDefault();
            onCancel();
            return;
        }
        if (e.key === "Enter") {
            e.preventDefault();

            const trimmedText = text.trim();
            if (trimmedText) {
                await onCommit(trimmedText);
            } else {
                onCancel();
            }
        }
    }

    return (
    <textarea
        className="nook-draft-artifact"
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        onDoubleClick={(e) => e.stopPropagation()}
        placeholder="What's on your mind?"
        style={{
            left: position.x,
            top: position.y,
        }}
    />
);
}
