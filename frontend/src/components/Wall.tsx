import type { Card, CardUpdate, DraftCard, Position } from "../types/cards";
import EmptyWorkspace from "./EmptyWorkspace";
import CardComponent from "./Card/Card";
import { CARD_ROTATIONS } from "../lib/CardRotation";
import DraftCardComponent from "./DraftCard";

interface WallProps {
  cards: Card[];
  draftCard: DraftCard | null;

  onCreate: (position: Position) => void;

  onUpdate: (id: number, update: CardUpdate) => Promise<void>;
  onDelete: (id: number) => Promise<void>;

  onCommitDraft: (text: string) => Promise<void>;
  onCancelDraft: () => void;

  selectedCardIds: number[]
  onToggleCardSelection: (cardId: number) => void
}

export default function Wall({ 
    cards, 
    draftCard, 
    onUpdate, 
    onDelete, 
    onCreate, 
    onCommitDraft, 
    onCancelDraft,
    selectedCardIds,
    onToggleCardSelection,
}: WallProps) {
  function handleDoubleClick(
    e: React.MouseEvent<HTMLDivElement>
) {
    const rect = e.currentTarget.getBoundingClientRect();
    onCreate({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
    });
}
  
  return (
    <div 
        className="nook-wall" 
        onDoubleClick={handleDoubleClick}>
      {cards.length === 0 && !draftCard ? (
        
        /* THE EMPTY STATE */
        <EmptyWorkspace />

      ) : (
        <>
          {/* THE CARDS */}
          {cards.map((card, index) => (
            <CardComponent
              key={card.id}
              card={card}
              index={index}
              onUpdate={onUpdate}
              onDelete={onDelete}
              isSelected={selectedCardIds.includes(card.id)}
              onToggleSelection={() => onToggleCardSelection(card.id)}
              style={{ 
                animationDelay: `${index * 0.09}s`,
                position: "absolute",
                left: card.x,
                top: card.y,
                "--card-rotate": `${CARD_ROTATIONS[index % 6]}deg`,
                background: `var(--nook-block-${(index%4) + 1})`
              }}
            />
          ))}
          {draftCard && (
    <DraftCardComponent
        position={{
            x: draftCard.x,
            y: draftCard.y,
        }}
        onCommit={onCommitDraft}
        onCancel={onCancelDraft}
    />
)}
        </>
      )}

    </div>
  );
}
