interface ArtifactBodyProps {
    text: string;
}

export default function ArtifactBody({
    text,
}: ArtifactBodyProps) {

    return (

        <p className="nook-artifact__body">
            {text}
        </p>

    );

}
