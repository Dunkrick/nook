import CardActions from "./CardActions";

interface CardHeaderProps {
    index: number;
    isHovered: boolean;
    onEdit: () => void;
    onDelete: () => void;
}

export default function CardHeader({
    index,
    isHovered,
    onEdit,
    onDelete,
}: CardHeaderProps) {
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
            }}
        >
            <span className="nook-block__number">
                {(index + 1).toString().padStart(2, "0")}
            </span>

            <CardActions
                isHovered={isHovered}
                onEdit={onEdit}
                onDelete={onDelete}
            />
        </div>
    );
}