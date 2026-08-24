import { useEffect, useRef, useState } from "react";
import type { Position } from "../types/artifacts";
import { toRenderPosition } from "../lib/workspace";

interface DraftArtifactProps {
    type: "TEXT" | "LINK";
    position: Position;
    onCommit: (text: string) => Promise<void>;
    onCancel: () => void;
}

export default function DraftArtifactComponent({
    type,
    position,
    onCommit,
    onCancel,
}: DraftArtifactProps) {

    const renderPosition = toRenderPosition(position);

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
        placeholder={type === "LINK" ? "Paste a link worth keeping…" : "What's on your mind?"}
        style={{
            left: renderPosition.x,
            top: renderPosition.y,
        }}
    />
);
}
