//this file only renders UI. It knows nothing about hooks. Nothing about dragging or updating.
//Presentation
import { cn } from "../../lib/cn";
import CardHeader from "./CardHeader";
import CardBody from "./CardBody";
import CardEditor from "./CardEditor";
import useCardInteraction from "./useCardInteraction";

interface CardViewProps {
    index: number;
    cardText: string;
    interaction: ReturnType<typeof useCardInteraction>;
    isSelected: boolean;
    onDelete: () => void;
    style?: React.CSSProperties & {
        [key: `--${string}`]: string | number;
    };
}

export default function CardView({
    index,
    cardText,
    interaction,
    isSelected,
    onDelete,
    style,
}: CardViewProps) {

    const {
        editing,
        drag,
        handleClick,
        handlePointerDown,
    } = interaction;

    return (

        <div
            className={cn(
                "nook-card",
                isSelected && "nook-card--selected",
                drag.isDragging && "nook-card--dragging",
                editing.isEditing && "nook-card--editing",
            )}
            style={{
                ...style,
                left: drag.position.x,
                top: drag.position.y,
            }}

            onPointerDown={handlePointerDown}
            onPointerMove={drag.handlePointerMove}
            onPointerUp={drag.handlePointerUp}
            onPointerCancel={drag.handlePointerCancel}
            onDoubleClick={(e) =>
                e.stopPropagation()
            }
            onClick={handleClick}>

            {editing.isEditing ? (

                <CardEditor
                    editText={editing.editText}
                    inputRef={ editing.inputRef as React.RefObject<HTMLInputElement> }
                    onTextChange={ editing.setEditText }
                    onKeyDown={ editing.handleKeyDown }
                    onSave={ editing.handleSave }
                    onCancel={ editing.handleCancel }/>
            ) : (
                <div className="nook-card__content">
                    <CardHeader
                        index={index}
                        onEdit={() => editing.setIsEditing(true) }
                        onDelete={onDelete} />
                    <CardBody
                        text={cardText} />
                </div>
            )}
        </div>
    );
}