import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { logout } from "../services/auth";
import { getCards, createCard, updateCard, deleteCard, type Card } from "../services/cards";
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
    const savedCard = await createCard(newCardText);
    
    // Update the UI immediately
    setCards([...cards, savedCard]); 
    
    // Clear the input
    setNewCardText("");
}

async function handleUpdateCard(id: number, text: string) {
    // Call the backend
    const updated = await updateCard(id, text);
    
    // Update the specific card in our array
    setCards(cards.map(c => c.id === id ? updated : c));
}

async function handleDeleteCard(id: number) {
    // Call the backend to delete
    await deleteCard(id);
    
    // Filter it out of our local React state
    setCards(cards.filter(c => c.id !== id));
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
        {cards.length === 0 ? (
  <div style={{ textAlign: "center", padding: "var(--nook-space-6)", color: "var(--nook-text-primary)" }}>
    <p style={{ fontSize: "var(--nook-text-h3)", fontWeight: "var(--nook-weight-medium)" }}>No cards yet.</p>
    <p>Time to build some momentum on your Wall!</p>
  </div>
) : (
  <Wall cards={cards} onUpdate={handleUpdateCard} onDelete={handleDeleteCard} />
)}
        </div>
    </div>
);

}