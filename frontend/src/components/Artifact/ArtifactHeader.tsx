import CardActions from "./ArtifactActions";

interface CardHeaderProps {
    index: number;
    onEdit: () => void;
    onDelete: () => void;
}

export default function CardHeader({
    index,
    onEdit,
    onDelete,
}: CardHeaderProps) {
    return (
        <div className="nook-card__header">
            <span className="nook-card__number">
                {(index + 1).toString().padStart(2, "0")}
            </span>

            <CardActions
                onEdit={onEdit}
                onDelete={onDelete}
            />
        </div>
    );
}
