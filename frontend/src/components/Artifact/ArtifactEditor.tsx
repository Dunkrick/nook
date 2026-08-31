interface ArtifactEditorProps {
    editText: string;
    inputRef: React.RefObject<HTMLInputElement | null>;
    onTextChange: (text: string) => void;
    onKeyDown: (
        e: React.KeyboardEvent<HTMLInputElement>
    ) => void;
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
                ref={inputRef}
                value={editText}
                onChange={(e) => onTextChange(e.target.value)}
                onKeyDown={onKeyDown}
                className="nook-artifact__input"
                aria-label="Edit thought"
            />
            <div className="nook-artifact__editor-actions">
                <button
                    onClick={onCancel}
                    className="nook-artifact__editor-action"
                >
                    Cancel
                </button>
                <button
                    onClick={onSave}
                    className="nook-artifact__editor-action"
                >
                    Save
                </button>
            </div>
        </div>
    );
}