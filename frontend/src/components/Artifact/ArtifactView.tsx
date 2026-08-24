//this file only renders UI. It knows nothing about hooks. Nothing about dragging or updating.
//Presentation
import { cn } from "../../lib/cn";
import ArtifactHeader from "./ArtifactHeader";
import ArtifactBody from "./ArtifactBody";
import LinkArtifactBody from "./LinkArtifactBody";
import ArtifactEditor from "./ArtifactEditor";
import useArtifactInteraction from "./useArtifactInteraction";
import type { Artifact } from "../../types/artifacts";
import { toRenderPosition } from "../../lib/workspace";

interface ArtifactViewProps {
    index: number;
    artifact: Artifact;
    interaction: ReturnType<typeof useArtifactInteraction>;
    isSelected: boolean;
    onDelete: () => void;
    style?: React.CSSProperties & {
        [key: `--${string}`]: string | number;
    };
}

export default function ArtifactView({
    index,
    artifact,
    interaction,
    isSelected,
    onDelete,
    style,
}: ArtifactViewProps) {

    const {
        editing,
        drag,
        handleClick,
        handlePointerDown,
    } = interaction;
    const renderPosition = toRenderPosition(drag.position);

    return (

        <div
            className={cn(
                "nook-artifact",
                isSelected && "nook-artifact--selected",
                drag.isDragging && "nook-artifact--dragging",
                editing.isEditing && "nook-artifact--editing",
            )}
            style={{
                ...style,
                left: renderPosition.x,
                top: renderPosition.y,
            }}

            onPointerDown={handlePointerDown}
            onPointerMove={drag.handlePointerMove}
            onPointerUp={drag.handlePointerUp}
            onPointerCancel={drag.handlePointerCancel}
            onDoubleClick={(e) =>
                e.stopPropagation()
            }
            onClick={handleClick}>

            {editing.isEditing ? (

                <ArtifactEditor
                    editText={editing.editText}
                    inputRef={ editing.inputRef as React.RefObject<HTMLInputElement> }
                    onTextChange={ editing.setEditText }
                    onKeyDown={ editing.handleKeyDown }
                    onSave={ editing.handleSave }
                    onCancel={ editing.handleCancel }/>
            ) : (
                <div className="nook-artifact__content">
                    <ArtifactHeader
                        index={index}
                        onEdit={artifact.type === "TEXT" ? () => editing.setIsEditing(true) : undefined}
                        onDelete={onDelete} />
                    {artifact.type === "TEXT" && (
                        <ArtifactBody text={artifact.content.text}/>
                    )}

                    {artifact.type === "LINK" && (
                        <LinkArtifactBody url={artifact.content.url}/>
                    )}
                </div>
            )}
        </div>
    );
}
