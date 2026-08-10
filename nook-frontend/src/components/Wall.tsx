import type { Card, CardUpdate, DraftCard, Position } from "../types/cards";
import CardComponent from "./Card";
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
        style={{ position: "relative", minHeight: "80vh" }} 
        onDoubleClick={handleDoubleClick}
    >
      
      {cards.length === 0 && !draftCard ? (
        
        /* THE EMPTY STATE */
        <div style={{ 
          position: "absolute", 
          top: "50%", 
          left: "50%", 
          transform: "translate(-50%, -50%)", 
          textAlign: "center",
          color: "var(--nook-text-primary)",
          opacity: 0.6
        }}>
          <div style={{
            width: "260px",
            height: "140px",
            border: "2px dashed var(--nook-color-charcoal)",
            borderRadius: "var(--nook-radius-xl)",
            margin: "0 auto var(--nook-space-4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: 0.4
          }}>
            <span style={{ fontSize: "24px" }}>[]</span>
          </div>
          <p style={{ fontSize: "var(--nook-text-h3)", fontWeight: "var(--nook-weight-medium)", margin: 0 }}>
            Double-click anywhere to begin.
          </p>
          <p style={{ marginTop: "var(--nook-space-2)" }}>
            Capture ideas, plans, reminders, or anything worth remembering.
          </p>
        </div>

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
                "--card-rotate": `${[-2, 1.5, 3, -1, 2.5, -1.5][index % 6]}deg`
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
