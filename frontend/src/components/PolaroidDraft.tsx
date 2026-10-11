import { useState } from "react";
import type { Position } from "../types/artifacts";
import { toRenderPosition } from "../lib/workspace";
import { uploadImage } from "../services/uploads";

interface PolaroidDraftProps {
    position: Position;
    onCommit: (imageKey: string) => Promise<void>;
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


    async function handleCommit() {
        if (!file || isLoading) return;

        setIsLoading(true);

        try {
            const uploaded = await uploadImage(file);
            await onCommit(uploaded.key);
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
            setPreviewUrl("");
            setFileError("Photo must be 10 MB or smaller.");
            event.currentTarget.value = "";
            return;
        }

        setFile(nextFile);
        setPreviewUrl(URL.createObjectURL(nextFile));
        setFileError("");
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

            {previewUrl && (
                <div className="nook-polaroid-draft__preview">
                    <img
                        src={previewUrl}
                        alt="Photo preview"
                    />
                </div>
            )}

            <div className="nook-polaroid-draft__actions">
                <button
                    type="button"
                    onClick={() => void handleCommit()}
                    disabled={!file || isLoading}
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