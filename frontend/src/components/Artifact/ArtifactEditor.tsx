interface ArtifactEditorProps {
    editText: string;
    inputRef: React.RefObject<HTMLInputElement | null>;
    onTextChange: (text: string) => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    onSave: () => void;
    onCancel: () => void;
}

export default function ArtifactEditor({
    editText,
    inputRef,
    onTextChange,
    onKeyDown,
    onSave,
    onCancel,
}: ArtifactEditorProps) {
    return (
        <div className="nook-artifact__editor">
            <input
                value={editText}
                ref={inputRef}
                onChange={(e) => onTextChange(e.target.value)}
                onKeyDown={onKeyDown}
                className="nook-card__input"
            />
            <button
                className="nook-button nook-button--quiet"
                onClick={onSave}
            >
                Save
            </button>
            <button
                onClick={onCancel}
                className="nook-button nook-button--quiet"
            >
                Cancel
            </button>
        </div>
    );
}
