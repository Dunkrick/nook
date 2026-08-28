interface ArtifactEditorProps {
    editText: string;
    inputRef: React.RefObject<HTMLInputElement | null>;
    onTextChange: (text: string) => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export default function ArtifactEditor({
    editText,
    inputRef,
    onTextChange,
    onKeyDown,
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
        </div>
    );
}