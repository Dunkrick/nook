import type { Card } from "../services/cards";
import CardComponent from "./Card";

interface WallProps {
  cards: Card[];
  onUpdate: (id: number, text: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

const positions = [
  {
    x: 10,
    y: 40,
  },
  {
    x: 320,
    y: 60
  },
  {
    x: 180,
    y: 220
  },
  {
    x: 400,
    y: 400
  },
]

export default function Wall({ cards, onUpdate, onDelete }: WallProps) {
  return (
    <div className="nook-wall" style={{ position: "relative", minHeight: "80vh"}}>
      {cards.map((card, index) => (
        <CardComponent
          key={card.id}
          card={card}
          index={index}
          onUpdate={onUpdate}
          onDelete={onDelete}
          style={{ "--card-rotate" : "-2deg", position: "absolute", left: positions[index%positions.length].x, top: positions[index%positions.length].y}}
        />
      ))}
    </div>
  );
}
