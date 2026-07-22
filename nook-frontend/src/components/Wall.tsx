import type { Card } from "../services/cards";
import CardComponent from "./Card";

interface WallProps {
  cards: Card[];
  onUpdate: (id: number, text: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

const positions = [
  {
    x: "13%",
    y: 35,
    rotate: -2,
  },
  {
    x: "39%",
    y: 55,
    rotate: 1.5,
  },
  {
    x: "67%",
    y: 80,
    rotate: 3,
  },
  {
    x: "17%",
    y: 245,
    rotate: -1,
  },
  {
    x: "43%",
    y: 275,
    rotate: 2.5,
  },
  {
    x: "69%",
    y: 295,
    rotate: -1.5, 
  },
  {
    x: "19%",
    y: 445,
    rotate: 1
  },
  {
    x: "48%",
    y: 475,
    rotate: -1.5
  },
  {
    x: "70%",
    y: 500,
    rotate: -2.5
  }
]

export default function Wall({ cards, onUpdate, onDelete }: WallProps) {
  return (
    <div className="nook-wall" style={{ position: "relative", minHeight: "80vh" }}>
      
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
              "--card-rotate": `${positions[index % positions.length].rotate}deg`, 
              position: "absolute", 
              left: positions[index % positions.length].x, 
              top: positions[index % positions.length].y, 
              animationDelay: `${index * 0.09}s` 
            }}
          />
        ))
      )}

    </div>
  );
}

