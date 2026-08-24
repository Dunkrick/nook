interface LinkArtifactEditorProps {
    url: string;
    onChange: (url: string) => void;
    onSave: () => void;
    onCancel: () => void;
}

export default function LinkArtifactEditor({
    url,
    onChange,
    onSave,
    onCancel,
}: LinkArtifactEditorProps) {
    return (
        <div className="nook-artifact__editor">
            <input
                value={url}
                placeholder="Paste a URL..."
                onChange={(e) =>
                    onChange(e.target.value)
                }
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        onSave();
                    }

                    if (e.key === "Escape") {
                        e.preventDefault();
                        onCancel();
                    }
                }}
                autoFocus
            />

            <button onClick={onSave}>
                Save
            </button>

            <button onClick={onCancel}>
                Cancel
            </button>
        </div>
    );
}