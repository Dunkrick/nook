import { useEffect, useRef, useState } from "react";
import { cn } from "../../lib/cn";
import {
    developsOnFirstMount,
    markPhotoAsDeveloped,
} from "../../lib/developingPhotos";
import { get } from "../../services/api";

/** Real film strips hold a short note. */
export const CAPTION_MAX_LENGTH = 48;

interface PolaroidArtifactBodyProps {
    artifactId: number;
    caption?: string;
    isSelected?: boolean;
    onSaveCaption: (caption: string) => void;
}

export default function PolaroidArtifactBody({
    artifactId,
    caption,
    isSelected = false,
    onSaveCaption,
}: PolaroidArtifactBodyProps) {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [error, setError] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isStripActive, setIsStripActive] = useState(false);
    const [editCaption, setEditCaption] = useState(caption ?? "");
    const [isDeveloping, setIsDeveloping] = useState(() =>
        developsOnFirstMount(artifactId)
    );
    const inputRef = useRef<HTMLInputElement>(null);
    const isOptimistic = artifactId <= 0;

    useEffect(() => {
        // An optimistic polaroid carries a temporary negative id that the
        // server has never heard of. Wait for the real id (the component
        // remounts on the swap) instead of asking for an image that cannot
        // exist yet.
        if (isOptimistic) {
            return;
        }

        let isCancelled = false;

        async function loadImage() {
            setError(false);
            setImageUrl(null);

        try {
            const data = (await get(
                `/artifacts/${artifactId}/image`,
            )) as { url?: string };

            if (!isCancelled) {
                if (data.url) {
                    setImageUrl(data.url);
                } else {
                    setError(true);
                }
            }
        } catch {
            if (!isCancelled) {
                setError(true);
            }
        }
    }

        loadImage();

        return () => {
            isCancelled = true;
            };
        }, [artifactId, isOptimistic]);

    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
            inputRef.current?.select();
        }
    }, [isEditing]);

    useEffect(() => {
        if (!isDeveloping) {
            return;
        }

        // This photo had its one develop pass. A remount stays developed.
        markPhotoAsDeveloped(artifactId);
    }, [isDeveloping, artifactId]);

    function startEditing() {
        // No caption saves until the server has the real artifact.
        if (isOptimistic) {
            return;
        }

        setEditCaption(caption ?? "");
        setIsEditing(true);
    }

    function saveCaption() {
        const nextCaption = editCaption.trim();

        // Nothing typed means nothing to send.
        if (nextCaption !== (caption ?? "")) {
            onSaveCaption(nextCaption);
        }

        setIsEditing(false);
    }

    function cancelEditing() {
        setIsEditing(false);
    }

    function handleCaptionKeyDown(
        e: React.KeyboardEvent<HTMLInputElement>
    ) {
        if (e.key === "Enter") {
            e.preventDefault();
            saveCaption();
            return;
        }

        if (e.key === "Escape") {
            e.preventDefault();
            cancelEditing();
        }
    }

    function handleStripKeyDown(
        e: React.KeyboardEvent<HTMLButtonElement>
    ) {
        if (e.key !== "Enter" && e.key !== " ") {
            return;
        }

        e.preventDefault();
        startEditing();
    }

    function handleAnimationEnd() {
        setIsDeveloping(false);
    }

    const showsPlaceholder = isSelected || isStripActive;

    return (
        <div
            className={cn(
                "nook-polaroid",
                isDeveloping && "nook-polaroid--developing",
            )}
        >
            <div
                className="nook-polaroid__image"
                onAnimationEnd={handleAnimationEnd}
            >
                {error ? (
                    <p className="nook-polaroid__error">
                        Photo didn't load. Reload the wall, or upload it again.
                    </p>
                ) : imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={caption || "Saved photo"}
                    />
                ) : (
                    <span className="nook-polaroid__loading" />
                )}
            </div>

            <div className="nook-polaroid__strip">
                {isEditing ? (
                    <input
                        ref={inputRef}
                        className="nook-polaroid__caption-input"
                        aria-label="Polaroid caption"
                        placeholder="Write something"
                        value={editCaption}
                        maxLength={CAPTION_MAX_LENGTH}
                        onChange={(e) => setEditCaption(e.target.value)}
                        onKeyDown={handleCaptionKeyDown}
                        onBlur={saveCaption}
                    />
                ) : (
                    <button
                        type="button"
                        className={cn(
                            "nook-polaroid__caption",
                            !caption && "nook-polaroid__caption--empty",
                        )}
                        aria-label="Polaroid caption"
                        onDoubleClick={startEditing}
                        onKeyDown={handleStripKeyDown}
                        onFocus={() => setIsStripActive(true)}
                        onBlur={() => setIsStripActive(false)}
                        onPointerDown={(e) => e.stopPropagation()}
                    >
                        {caption ||
                            (showsPlaceholder ? "Write something" : "")}
                    </button>
                )}
            </div>
        </div>
    );
}
