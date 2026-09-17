import { useEffect, useState } from "react";
import { getToken } from "../../lib/storage";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3003").replace(/\/$/, "");

interface PolaroidArtifactBodyProps {
    artifactId: number;
}

export default function PolaroidArtifactBody({
    artifactId,
}: PolaroidArtifactBodyProps) {
    const [blobUrl, setBlobUrl] = useState<string | null>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        let revoked = false;
        let objectUrl: string | null = null;

        async function loadImage() {
            setError(false);
            setBlobUrl(null);

            const token = getToken();

            try {
                const response = await fetch(
                    `${API_URL}/artifacts/${artifactId}/image`,
                    {
                        headers: token
                            ? { Authorization: `Bearer ${token}` }
                            : {},
                        // Follow the redirect to GCS automatically.
                        redirect: "follow",
                    },
                );

                if (!response.ok) {
                    setError(true);
                    return;
                }

                const blob = await response.blob();

                if (!revoked) {
                    objectUrl = URL.createObjectURL(blob);
                    setBlobUrl(objectUrl);
                }
            } catch {
                if (!revoked) {
                    setError(true);
                }
            }
        }

        loadImage();

        return () => {
            revoked = true;
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [artifactId]);

    return (
        <div className="nook-polaroid">
            <div className="nook-polaroid__image">
                {error ? (
                    <span className="nook-polaroid__error">
                        Image unavailable
                    </span>
                ) : blobUrl ? (
                    <img src={blobUrl} alt="Saved photo" />
                ) : (
                    <span className="nook-polaroid__loading" />
                )}
            </div>
        </div>
    );
}
