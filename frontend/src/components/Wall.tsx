import type { Artifact, ArtifactUpdate, DraftArtifact, Position } from "../types/artifacts";
import EmptyWorkspace from "./EmptyWorkspace";
import ArtifactComponent from "./Artifact/Artifact";
import { getArtifactColorToken, getArtifactRotation } from "../lib/ArtifactRotation";
import DraftArtifactComponent from "./DraftArtifact";
import ArtifactCreationPicker from "./ArtifactCreationPicker";
import { useCanvasCamera } from "../hooks/useCanvasCamera";
import { fromRenderPosition } from "../lib/workspace";

interface WallProps {
  artifacts: Artifact[];
  draftArtifact: DraftArtifact | null;

  createPosition: Position | null;
  onSelectArtifactType: (type: "TEXT" | "LINK") => void;
  onCancelCreation: () => void;

  onCreate: (position: Position) => void;
  onUpdate: (id: number, update: ArtifactUpdate) => Promise<void>;
  onDelete: (id: number) => Promise<void>;

  onCommitDraftText: (text: string) => Promise<void>;
  onCommitDraftLink: (url: string) => Promise<void>;
  onCancelDraft: () => void;

  selectedArtifactIds: number[]
  onToggleArtifactSelection: (artifactId: number) => void

  editingArtifactId: number | null;
  onEditingArtifactChange: (artifactId: number | null) => void;

  homePosition: Position;
}

export default function Wall({ 
    artifacts, 
    draftArtifact, 
    onUpdate, 
    onDelete, 
    onCreate, 
    onCommitDraftText,
    onCommitDraftLink,
    onCancelDraft,
    selectedArtifactIds,
    onToggleArtifactSelection,
    createPosition,
    onSelectArtifactType,
    onCancelCreation,
    editingArtifactId,
    onEditingArtifactChange,
    homePosition,
}: WallProps) {
  const camera = useCanvasCamera();

  function handleDoubleClick(
    e: React.MouseEvent<HTMLDivElement>
) {
    if (editingArtifactId !== null) {
        onEditingArtifactChange(null);
        return;
    }

    const viewport = e.currentTarget.closest(".nook-viewport");
    if (!viewport) return;

    const rect = viewport.getBoundingClientRect();

    const worldPosition = camera.screenToWorld(
        {
            x: e.clientX,
            y: e.clientY,
        },
        rect
    );
    onCreate(fromRenderPosition(worldPosition));
}

function handlePointerDown(
    e: React.PointerEvent<HTMLDivElement>
) {
    if (e.target !== e.currentTarget) {
        return;
    }

    if (editingArtifactId !== null) {
        onEditingArtifactChange(null);
    }
}
  
  return (
    <div 
        className="nook-wall" 
        aria-label="Thought wall. Double-click to add a thought."
        onPointerDown={handlePointerDown}
        onDoubleClick={handleDoubleClick}
        >
      {artifacts.length === 0 && !draftArtifact && (
        <EmptyWorkspace home={homePosition} />
      )}

      {createPosition && (
    <ArtifactCreationPicker
        position={createPosition}
        onSelect={onSelectArtifactType}
        onCancel={onCancelCreation}
    />
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
            isEditing={editingArtifactId === artifact.id}
            onEditingChange={(isEditing) =>
                onEditingArtifactChange(
                    isEditing ? artifact.id : null
                )
            }
            
            style={{
                "--artifact-rotate": `${getArtifactRotation(artifact.id)}deg`,
                "--artifact-color": `var(--artifact-${getArtifactColorToken(artifact.id)})`,
            }}
        />
    ))}

    {draftArtifact && (
        <DraftArtifactComponent
            type={draftArtifact.type}
            position={{
                x: draftArtifact.x,
                y: draftArtifact.y,
            }}
            onCommit={draftArtifact.type === "TEXT" ? onCommitDraftText : onCommitDraftLink}
            onCancel={onCancelDraft}
        />
    )}

    </div>
  );
}
