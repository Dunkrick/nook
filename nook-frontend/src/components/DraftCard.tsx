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

    useEffect(() => {
    const el = textareaRef.current;

    if (!el) return;

    el.style.height = "0px";
    el.style.height = `${el.scrollHeight}px`;

    }, [text]);

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
        placeholder="Start with a thought..."
        style={{
            position: "absolute",
            left: position.x,
            top: position.y,
            width: "300px",
            minHeight: "100px",
            resize: "none",
            padding:"var(--nook-space-6)",
            borderRadius: "var(--nook-radius-lg)",
            border:"2px solid var(--nook-border-block)",
            outline: "none",
            background: "var(--nook-block-1)",
            color: "var(--nook-text-on-block)",
            fontFamily: "var(--nook-font-sans)",
            fontSize: "var(--nook-text-body)",
            boxShadow:"var(--shadow-resting)",
        }}
    />
);
}