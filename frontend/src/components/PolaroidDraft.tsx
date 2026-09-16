import { useState } from "react";
import type { Position } from "../types/artifacts";
import { toRenderPosition } from "../lib/workspace";

interface PolaroidDraftProps {
    position: Position;
    onCommit: (imageUrl: string) => Promise<void>;
    onCancel: () => void;
}

export default function PolaroidDraft({
    position,
    onCommit,
    onCancel,
}: PolaroidDraftProps) {
    const renderPosition = toRenderPosition(position);
    const [imageUrl, setImageUrl] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const trimmedUrl = imageUrl.trim();

    async function handleCommit() {
        if (!trimmedUrl || isLoading) return;

        setIsLoading(true);

        try {
            await onCommit(trimmedUrl);
        } finally {
            setIsLoading(false);
        }
    }

    function handleKeyDown(
        e: React.KeyboardEvent<HTMLInputElement>
    ) {
        if (e.key === "Escape") {
            e.preventDefault();
            onCancel();
        }

        if (e.key === "Enter") {
            e.preventDefault();
            void handleCommit();
        }
    }

    return (
        <div
            className="nook-polaroid-draft"
            style={{
                left: renderPosition.x,
                top: renderPosition.y,
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onDoubleClick={(e) => e.stopPropagation()}
        >
            <p className="nook-polaroid-draft__title">
                Add a photo
            </p>

            <input
                autoFocus
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Paste an image URL…"
                disabled={isLoading}
            />

            {trimmedUrl && (
                <div className="nook-polaroid-draft__preview">
                    <img
                        src={trimmedUrl}
                        alt="Photo preview"
                    />
                </div>
            )}

            <div className="nook-polaroid-draft__actions">
                <button
                    type="button"
                    onClick={() => void handleCommit()}
                    disabled={!trimmedUrl || isLoading}
                >
                    {isLoading ? "Adding…" : "Add Photo"}
                </button>

                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isLoading}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}