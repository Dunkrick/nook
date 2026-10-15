import { useEffect, useRef, useState } from "react";
import { CAPTION_MAX_LENGTH } from "../components/Artifact/PolaroidArtifactBody";
import type { Position } from "../types/artifacts";
import { toRenderPosition } from "../lib/workspace";
import { uploadImage } from "../services/uploads";

interface PolaroidDraftProps {
    position: Position;
    onCommit: (imageKey: string, caption?: string) => Promise<void>;
    onCancel: () => void;
}

export default function PolaroidDraft({
    position,
    onCommit,
    onCancel,
}: PolaroidDraftProps) {
    const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
    const renderPosition = toRenderPosition(position);
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [fileError, setFileError] = useState("");
    const [caption, setCaption] = useState("");
    const captionInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    async function handleCommit() {
        if (!file || isLoading) return;

        setIsLoading(true);
        setFileError("");

        try {
            const uploaded = await uploadImage(file);
            await onCommit(uploaded.key, caption.trim() || undefined);
        } catch (error) {
            console.error(error);
            setFileError("Couldn't upload that photo. Check your connection and try again.");
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

    function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        const nextFile = event.currentTarget.files?.[0];
        if (!nextFile) return;

        if (nextFile.size > MAX_PHOTO_BYTES) {
            setFile(null);
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
            setPreviewUrl("");
            setCaption("");
            setFileError("Photo must be 10 MB or smaller.");
            event.currentTarget.value = "";
            return;
        }

        setFile(nextFile);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(URL.createObjectURL(nextFile));
        setFileError("");
        setCaption("");
    }

    useEffect(() => {
        if (file) {
            captionInputRef.current?.focus();
        }
    }, [file]);

    // Stage 1: No file chosen — compact panel with file input
    if (!file) {
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
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                />

                {fileError && (
                    <p className="nook-polaroid-draft__error" role="alert">
                        {fileError}
                    </p>
                )}

                <div className="nook-polaroid-draft__actions">
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

    // Stage 2: file chosen. The frame is the draft, so you write on the photo itself.
    return (
        <div
            className="nook-polaroid-draft nook-polaroid-draft--framed"
            style={{
                left: renderPosition.x,
                top: renderPosition.y,
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onDoubleClick={(e) => e.stopPropagation()}
        >
            <div className="nook-polaroid">
                <div className="nook-polaroid__image">
                    <img
                        src={previewUrl}
                        alt="Photo preview"
                    />
                </div>

                <div className="nook-polaroid__strip">
                    <input
                        ref={captionInputRef}
                        className="nook-polaroid__caption-input"
                        aria-label="Polaroid caption"
                        placeholder="Write something"
                        value={caption}
                        maxLength={CAPTION_MAX_LENGTH}
                        onChange={(e) => setCaption(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isLoading}
                    />
                </div>
            </div>

            {fileError && (
                <p className="nook-polaroid-draft__error" role="alert">
                    {fileError}
                </p>
            )}

            <div className="nook-polaroid-draft__actions">
                <button
                    type="button"
                    onClick={() => void handleCommit()}
                    disabled={isLoading}
                >
                    {isLoading ? "Adding…" : "Add photo"}
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