import type { Position } from "../types/artifacts";

interface ArtifactCreationPickerProps {
    position: Position;
    onSelect: (type: "TEXT" | "LINK") => void;
    onCancel: () => void;
}

export default function ArtifactCreationPicker({
    onSelect,
    onCancel,
}: ArtifactCreationPickerProps) {
    return (
        <div className="nook-artifact-picker">
            <p className="nook-artifact-picker__title">
                What do you want to leave here?
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

                <button
                    type="button"
                    onClick={onCancel}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}