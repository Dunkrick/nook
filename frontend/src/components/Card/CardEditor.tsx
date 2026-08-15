interface CardEditorProps {
    editText: string;
    inputRef: React.RefObject<HTMLInputElement>;
    onTextChange: (text: string) => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    onSave: () => void;
    onCancel: () => void;
}

export default function CardEditor({
    editText,
    inputRef,
    onTextChange,
    onKeyDown,
    onSave,
    onCancel,
}: CardEditorProps) {
    return (
        <div style={{ display: "flex", gap: "var(--nook-space-2)", width: "100%" }}>
            <input
                value={editText}
                ref={inputRef}
                onChange={(e) => onTextChange(e.target.value)}
                onKeyDown={onKeyDown}
                style={{
                    flex: 1,
                    padding: "var(--nook-space-3)",
                    border: "1px solid var(--nook-border-block)",
                    borderRadius: "var(--nook-radius-sm)",
                    fontFamily: "var(--nook-font-sans)",
                }}
            />
            <button
                className="nook-button-primary"
                style={{ background: "var(--nook-text-on-block)", color: "var(--nook-bg)" }}
                onClick={onSave}
            >
                Save
            </button>
            <button
                onClick={onCancel}
                style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--nook-text-on-block)",
                    fontWeight: "var(--nook-weight-bold)",
                }}
            >
                Cancel
            </button>
        </div>
    );
}
