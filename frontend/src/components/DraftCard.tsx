import { useEffect, useRef, useState } from "react";
import type { Position } from "../types/cards";

interface DraftCardProps {
    position: Position;
    onCommit: (text: string) => Promise<void>;
    onCancel: () => void;
}

export default function DraftCardComponent({
    position,
    onCommit,
    onCancel,
}: DraftCardProps) {

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
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        onDoubleClick={(e) => e.stopPropagation()}
        placeholder="What's on your mind?"
        style={{
            position: "absolute",
            left: position.x,
            top: position.y,

            minWidth: "var(--card-min-width)",
            minHeight: "140px",

            resize: "none",

            padding: "var(--nook-space-4)",

            borderRadius: "var(--card-radius)",

            border: "var(--card-border)",

            outline: "none",

            background: "var(--nook-block-1)",

            color: "var(--nook-text-on-block)",

            fontFamily: "var(--nook-font-sans)",

            fontSize: "var(--nook-text-body)",

            boxShadow: "var(--card-highlight), var(--card-shadow)",

            opacity: "var(--card-draft-opacity)",
        }}
    />
);
}