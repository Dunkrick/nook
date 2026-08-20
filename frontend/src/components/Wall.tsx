import type { TextArtifact, ArtifactUpdate, DraftArtifact, Position } from "../types/artifacts";
import EmptyWorkspace from "./EmptyWorkspace";
import ArtifactComponent from "./Artifact/Artifact";
import { ARTIFACT_ROTATIONS } from "../lib/ArtifactRotation";
import DraftArtifactComponent from "./DraftArtifact";

interface WallProps {
  artifacts: TextArtifact[];
  draftArtifact: DraftArtifact | null;

  onCreate: (position: Position) => void;

  onUpdate: (id: number, update: ArtifactUpdate) => Promise<void>;
  onDelete: (id: number) => Promise<void>;

  onCommitDraft: (text: string) => Promise<void>;
  onCancelDraft: () => void;

  selectedArtifactIds: number[]
  onToggleArtifactSelection: (artifactId: number) => void
}

export default function Wall({ 
    artifacts, 
    draftArtifact, 
    onUpdate, 
    onDelete, 
    onCreate, 
    onCommitDraft, 
    onCancelDraft,
    selectedArtifactIds,
    onToggleArtifactSelection,
}: WallProps) {
  function handleDoubleClick(
    e: React.MouseEvent<HTMLDivElement>
) {
    const world = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - world.left;
    const y = e.clientY - world.top;
    onCreate({
        x,
        y,
    });

}
  
  return (
    <div 
        className="nook-wall" 
        aria-label="Thought wall. Double-click to add a thought."
        onDoubleClick={handleDoubleClick}>
      {artifacts.length === 0 && !draftArtifact && (
        <EmptyWorkspace />
      )}

      {artifacts.map((artifact, index) => (
        <ArtifactComponent
            key={artifact.id}
            artifact={artifact}
            index={index}
            onUpdate={onUpdate}
            onDelete={onDelete}
            isSelected={selectedArtifactIds.includes(artifact.id)}
            onToggleSelection={() => onToggleArtifactSelection(artifact.id)}
            style={{
                left: artifact.x,
                top: artifact.y,
                "--artifact-rotate": `${ARTIFACT_ROTATIONS[index % 6]}deg`,
                "--artifact-color": `var(--artifact-${(index % 4) + 1})`,
            }}
        />
    ))}

    {draftArtifact && (
        <DraftArtifactComponent
            position={{
                x: draftArtifact.x,
                y: draftArtifact.y,
            }}
            onCommit={onCommitDraft}
            onCancel={onCancelDraft}
        />
    )}

    </div>
  );
}
