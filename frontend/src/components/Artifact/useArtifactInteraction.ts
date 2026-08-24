//this is the orchestrator as it calls useCardDrag() and userCardEditing()
//this is not a smart one, it simply composes two existing hooks
import { useArtifactEditing } from "../../hooks/useArtifactEditing";
import { useArtifactDrag } from "../../hooks/useArtifactDrag";

import type { Artifact, ArtifactUpdate } from "../../types/artifacts";

interface UseArtifactInteractionProps {
    artifact: Artifact;
    onUpdate: (
        id: number,
        update: ArtifactUpdate
    ) => Promise<void>;

    onToggleSelection: () => void;
}

export default function useArtifactInteraction({
    artifact,
    onUpdate,
    onToggleSelection,
}: UseArtifactInteractionProps) {

    const editing = useArtifactEditing({
        artifactId: artifact.id,
        initialText: artifact.type === "TEXT" ? artifact.content.text : "",
        onUpdate,
    });

    const drag = useArtifactDrag({
        artifactId: artifact.id,
        initialX: artifact.x,
        initialY: artifact.y,
        onUpdate,
    });

    function handleClick(
        e: React.MouseEvent<HTMLDivElement>
    ) {

        if (!e.metaKey && !e.ctrlKey)
            return;

        e.stopPropagation();

        onToggleSelection();
    }

    function handlePointerDown(
        e: React.PointerEvent<HTMLDivElement>
    ) {

        if (editing.isEditing)
            return;

        drag.handlePointerDown(e);

    }

    return {
        editing,
        drag,
        handleClick,
        handlePointerDown,
    };

}