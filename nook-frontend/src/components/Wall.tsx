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
    <div className="nook-wall" style={{ position: "relative", minHeight: "80vh"}}>
      {cards.map((card, index) => (
        <CardComponent
          key={card.id}
          card={card}
          index={index}
          onUpdate={onUpdate}
          onDelete={onDelete}
          style={{ "--card-rotate": `${positions[index%positions.length].rotate}deg`, position: "absolute", left: positions[index%positions.length].x, top: positions[index%positions.length].y, animationDelay: `${index * 0.09}s`}}
        />
      ))}
    </div>
  );
}
