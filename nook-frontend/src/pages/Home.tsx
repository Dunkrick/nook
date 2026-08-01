import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { logout } from "../services/auth";
import { getCards, createCard, updateCard, deleteCard, type Card, type CardUpdate } from "../services/cards";
import Wall from "../components/Wall"
import "../assets/nook-tokens.css";

export default function Home() {
    const navigate = useNavigate();
    const [cards, setCards] = useState<Card[]>([]);
    const [newCardText, setNewCardText] = useState("");

    useEffect(() => {
        async function fetchCards() {
            const cards = await getCards();
            setCards(cards);
        }
        fetchCards();
    }, []);

    async function handleAddCard() {
    if (!newCardText.trim()) return; // Don't submit empty strings
    
    // Call our backend
    const column = cards.length % 3;
    const row = Math.floor(cards.length / 3);
    const savedCard = await createCard({
        text: newCardText,
        x: 32 + column * 260,
        y: 32 + row * 170,
    });
    
    // Update the UI immediately
    setCards((currentCards) => [...currentCards, savedCard]);
    
    // Clear the input
    setNewCardText("");
}

async function handleUpdateCard(id: number, update: CardUpdate) {
    // Call the backend
    const updated = await updateCard(id, update);
    
    // Update the specific card in our array
    setCards((currentCards) => currentCards.map((card) => card.id === id ? updated : card));
}

async function handleDeleteCard(id: number) {
    // Call the backend to delete
    await deleteCard(id);
    
    // Filter it out of our local React state
    setCards((currentCards) => currentCards.filter((card) => card.id !== id));
}

    return (
    <div>
        {/* HEADER */}
        <div style={{ padding: "var(--nook-space-5)", maxWidth: "600px", margin: "0 auto" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--nook-space-7)" }}>
            <h1 className="nook-logo">
                Nook<span className="nook-logo__spark"></span>
            </h1>
            <button 
                className="nook-button-primary" 
                style={{ padding: "var(--nook-space-2) var(--nook-space-4)", fontSize: "var(--nook-text-caption)" }}
                onClick={() => { logout(); navigate("/") }}>
                Logout
            </button>
        </header>

        {/* HERO BLOCK: CREATE CARD FORM */}
        <div className="nook-hero-block" style={{ marginBottom: "var(--nook-space-7)" }}>
            <h1>What's next on your Wall?</h1>
            <div style={{ display: "flex", gap: "var(--nook-space-3)" }}>
                <input 
                    placeholder="Type it into reality..." 
                    style={{ 
                        flex: 1, 
                        padding: "var(--nook-space-3)", 
                        borderRadius: "var(--nook-radius-md)", 
                        border: "none",
                        fontFamily: "var(--nook-font-sans)",
                        fontSize: "var(--nook-text-body)"
                    }}
                    value={newCardText} 
                    onChange={(e) => setNewCardText(e.target.value)}
                />
                <button className="nook-button-primary" onClick={handleAddCard}>Add</button>
            </div>
        </div>
        </div>

        {/* CARDS LIST / WALL */}
        <div style={{ padding: "var(--nook-space-5)"}}>
            <Wall cards={cards} onUpdate={handleUpdateCard} onDelete={handleDeleteCard} />
        </div>
    </div>
    );
};
