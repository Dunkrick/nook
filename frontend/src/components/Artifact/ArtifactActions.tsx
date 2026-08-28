interface ArtifactActionsProps {
    onEdit?: () => void;
    onDelete: () => void;
}

export default function ArtifactActions({
    onEdit,
    onDelete,
}: ArtifactActionsProps) {
    return (
        <div
            className="nook-artifact__actions"
            onClick={(e) => e.stopPropagation()}
        >
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