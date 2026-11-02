import ArtifactActions from "./ArtifactActions";

interface ArtifactHeaderProps {
    index: number;
    onEdit?: () => void;
    onDelete: () => void;
}

export default function ArtifactHeader({
    index,
    onEdit,
    onDelete,
}: ArtifactHeaderProps) {
    return (
        <div className="nook-artifact__header">
            <span className="nook-artifact__number">
                {(index + 1).toString().padStart(2, "0")}
            </span>

            <ArtifactActions
                onEdit={onEdit}
                onDelete={onDelete}
            />
        </div>
    );
}
