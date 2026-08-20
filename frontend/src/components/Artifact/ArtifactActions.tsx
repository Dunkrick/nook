interface CardActionsProps {
    onEdit: () => void;
    onDelete: () => void;
}

export default function CardActions({ onEdit, onDelete }: CardActionsProps) {
    return (
        <div
            className="nook-card__actions"
            onClick={(e) => e.stopPropagation()}
        >
            <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                }}
                className="nook-icon-button"
                aria-label="Edit thought"
            >
                Edit
            </button>
            <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                }}
                className="nook-icon-button nook-icon-button--danger"
                aria-label="Delete thought"
            >
                Delete
            </button>
        </div>
    );
}
