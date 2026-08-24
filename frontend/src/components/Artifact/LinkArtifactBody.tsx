interface LinkArtifactBodyProps {
    url: string;
}

export default function LinkArtifactBody({
    url,
}: LinkArtifactBodyProps) {
    return (
        <a
            className="nook-artifact__link"
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
        >
            {url}
        </a>
    );
}