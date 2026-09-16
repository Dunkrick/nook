interface PolaroidArtifactBodyProps {
    imageUrl: string;
}

export default function PolaroidArtifactBody({
    imageUrl,
}: PolaroidArtifactBodyProps) {
    return (
        <div className="nook-polaroid">
            <div className="nook-polaroid__image">
                <img
                    src={imageUrl}
                    alt="Saved photo"
                />
            </div>
        </div>
    );
}