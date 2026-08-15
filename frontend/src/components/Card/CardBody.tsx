interface CardBodyProps {
    text: string;
}

export default function CardBody({
    text,
}: CardBodyProps) {

    return (

        <p
            className="nook-block__label"
            style={{ margin: 0 }}
        >
            {text}
        </p>

    );

}