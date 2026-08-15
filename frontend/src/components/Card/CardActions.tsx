interface CardActionsProps {
    isHovered: boolean;
    onEdit: () => void;
    onDelete: () => void;
}

export default function CardActions({ isHovered, onEdit, onDelete }: CardActionsProps) {
    return (
        <div
            onClick={(e) => e.stopPropagation()}
            style={{
                opacity: isHovered ? 1 : 0,
                pointerEvents: isHovered ? "auto" : "none",
                transition: "opacity var(--motion-settle)",
                display: "flex",
                gap: "var(--nook-space-2)",
            }}
        >
            <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                }}
                style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--nook-text-on-block)",
                    cursor: "pointer",
                    fontWeight: "var(--nook-weight-medium)",
                }}
            >
                Edit
            </button>
            <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                }}
                style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--nook-text-on-block)",
                    cursor: "pointer",
                    fontWeight: "var(--nook-weight-bold)",
                }}
            >
                Delete
            </button>
        </div>
    );
}
