import TintPicker from "./TintPicker";

interface ArtifactActionsProps {
    onEdit?: () => void;
    onDelete: () => void;
    currentTint?: string | null;
    onSelectTint?: (tint: string | null) => void;
}

export default function ArtifactActions({
    onEdit,
    onDelete,
    currentTint,
    onSelectTint,
}: ArtifactActionsProps) {
    return (
        <div
            className="nook-artifact__actions"
            onClick={(e) => e.stopPropagation()}
        >
            {onSelectTint && (
                <TintPicker
                    currentTint={currentTint}
                    onSelectTint={onSelectTint}
                />
            )}

            {onEdit && (
                <button
                    type="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit();
                    }}
                    className="nook-artifact__action"
                    aria-label="Edit thought"
                    title="Edit"
                >
                    ✎
                </button>
            )}

            <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                }}
                className="nook-artifact__action nook-artifact__action--danger"
                aria-label="Delete thought"
                title="Delete"
            >
                ×
            </button>
        </div>
    );
}