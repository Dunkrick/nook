//the container
import type { Artifact, ArtifactUpdate } from "../../types/artifacts";
import ArtifactView from "./ArtifactView";
import useArtifactInteraction from "./useArtifactInteraction";

interface ArtifactProps {
    artifact: Artifact;
    index: number;

    onUpdate: (
        id: number,
        update: ArtifactUpdate
    ) => Promise<void>;

    onDelete: (
        id: number
    ) => Promise<void>;

    style?: React.CSSProperties & {
        [key: `--${string}`]:
            string | number;
    };

    isSelected: boolean;
    onToggleSelection: () => void;

    isEditing: boolean;
    onEditingChange: (isEditing: boolean) => void;
}

export default function ArtifactComponent({ artifact, index, onUpdate, onDelete, style, isSelected, isEditing, onToggleSelection, onEditingChange }: ArtifactProps) {
    const interaction =
        useArtifactInteraction({
            artifact,
            onUpdate,
            onToggleSelection,
            isEditing,
            onEditingChange,
        });

    return (

        <ArtifactView
            index={index}
            artifact={artifact}
            interaction={interaction}
            isSelected={isSelected}
            style={style}
            onDelete={() => onDelete(artifact.id)}
        />
    );
}
