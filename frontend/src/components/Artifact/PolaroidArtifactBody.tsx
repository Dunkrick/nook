import { useEffect, useState } from "react";
import { getToken } from "../../lib/storage";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3003").replace(/\/$/, "");

interface PolaroidArtifactBodyProps {
    artifactId: number;
}

export default function PolaroidArtifactBody({
    artifactId,
}: PolaroidArtifactBodyProps) {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        let isCancelled = false;

        async function loadImage() {
            setError(false);
            setImageUrl(null);

            const token = getToken();

            try {
                const response = await fetch(
                    `${API_URL}/artifacts/${artifactId}/image`,
                    {
                        headers: token
                            ? { Authorization: `Bearer ${token}` }
                            : {},
                    },
                );

                if (!response.ok) {
                    if (!isCancelled) setError(true);
                    return;
                }

                const data = (await response.json()) as { url?: string };

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
    }, [artifactId]);

    return (
        <div className="nook-polaroid">
            <div className="nook-polaroid__image">
                {error ? (
                    <span className="nook-polaroid__error">
                        Image unavailable
                    </span>
                ) : imageUrl ? (
                    <img src={imageUrl} alt="Saved photo" />
                ) : (
                    <span className="nook-polaroid__loading" />
                )}
            </div>
        </div>
    );
}
