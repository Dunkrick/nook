interface CardBodyProps {
    text: string;
}

export default function CardBody({
    text,
}: CardBodyProps) {

    return (

        <p className="nook-card__body">
            {text}
        </p>

    );

}
