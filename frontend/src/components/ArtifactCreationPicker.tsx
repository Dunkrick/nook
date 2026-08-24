import type { Position } from "../types/artifacts";
import { toRenderPosition } from "../lib/workspace";

interface ArtifactCreationPickerProps {
    position: Position;
    onSelect: (type: "TEXT" | "LINK") => void;
    onCancel: () => void;
}

export default function ArtifactCreationPicker({
    position,
    onSelect,
    onCancel,
}: ArtifactCreationPickerProps) {
    const renderPosition = toRenderPosition(position);

    return (
        <div
            className="nook-artifact-picker"
            style={{
                left: renderPosition.x,
                top: renderPosition.y,
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onDoubleClick={(e) => e.stopPropagation()}
        >
            <p className="nook-artifact-picker__title">
                Leave something here
            </p>

            <div className="nook-artifact-picker__actions">
                <button
                    type="button"
                    onClick={() => onSelect("TEXT")}
                >
                    Thought
                </button>

                <button
                    type="button"
                    onClick={() => onSelect("LINK")}
                >
                    Link
                </button>
            </div>

            <button
                type="button"
                className="nook-artifact-picker__cancel"
                onClick={onCancel}
            >
                Cancel
            </button>
        </div>
    );
}
