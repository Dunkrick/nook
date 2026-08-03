import type { Card, CardUpdate, DraftCard, Position } from "../types/cards";
import CardComponent from "./Card";

interface WallProps {
  cards: Card[];
  draftCard: DraftCard | null;
  onCreate: (position: Position) => void;
  onUpdate: (id: number, update: CardUpdate) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export default function Wall({ cards, draftCard, onUpdate, onDelete, onCreate }: WallProps) {
  function handleDoubleClick(
    e: React.MouseEvent<HTMLDivElement>
) {
    console.log("Wall double clicked");
    const rect = e.currentTarget.getBoundingClientRect();
    onCreate({
        x: e.nativeEvent.offsetX,
        y: e.nativeEvent.offsetY,
    });
}
  
  return (
    <div className="nook-wall" style={{ position: "relative", minHeight: "80vh" }} onDoubleClick={handleDoubleClick}>
      
      {cards.length === 0 ? (
        
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
            Your wall is clear.
          </p>
          <p style={{ marginTop: "var(--nook-space-2)" }}>
            Add a card above to start placing your thoughts.
          </p>
        </div>

      ) : (

        /* THE CARDS */
        cards.map((card, index) => (
          <CardComponent
            key={card.id}
            card={card}
            index={index}
            onUpdate={onUpdate}
            onDelete={onDelete}
            style={{ 
              animationDelay: `${index * 0.09}s`,
              position: "absolute",
              left: card.x,
              top: card.y,
              "--card-rotate": `${[-2, 1.5, 3, -1, 2.5, -1.5][index % 6]}deg`
            }}
          />
        ))
      )}

    </div>
  );
}
