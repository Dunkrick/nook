import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { logout } from "../services/auth";
import SelectionToolbar from "../components/SelectionToolbar"
import { getCards, createCard, updateCard, deleteCard } from "../services/cards";
import type { Card, CardUpdate, DraftCard, Position } from "../types/cards";
import Wall from "../components/Wall"
import "../assets/nook-tokens.css";

export default function Home() {
    const navigate = useNavigate();
    const [cards, setCards] = useState<Card[]>([]);
    const [draftCard, setDraftCard] = useState<DraftCard | null>(null);
    const [newCardText, setNewCardText] = useState("");
    // TODO(v5): Remove hero input once wall-first creation is complete.
    const [selectedCardIds, setSelectedCardIds] = useState<number[]>([]);
    const [isInsightOpen, setIsReflectionOpen] = useState(false);

    function handleCreateDraft(position: Position) {
        setDraftCard({
            text: "",
            x: position.x,
            y: position.y,
        });
    }

    async function handleCommitDraft(text: string) {
    if (!draftCard) return;

    const savedCard = await createCard({
        text,
        x: draftCard.x,
        y: draftCard.y,
    });

    setCards((current) => [...current, savedCard]);
    setDraftCard(null);
    }

    function handleCancelDraft() {
    setDraftCard(null);
    }
    
    useEffect(() => {
        async function fetchCards() {
            const fetchedCards = await getCards();
            setCards(fetchedCards);
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

function toggleCardSelection(cardId: number) {
    setSelectedCardIds((current) => {
        const isSelected = current.includes(cardId);

        if (isSelected) {
            return current.filter((id) => id !== cardId);
        }

        return [...current, cardId];
    });
}

function handleClearSelection(){
    setSelectedCardIds([]);
}

function handleFindInsight() {
    console.log("Find Insight");
    setIsReflectionOpen(true);
}
    return (
    <div>
        {/* HEADER */}
        <div style={{ padding: "var(--nook-space-5)", maxWidth: "600px", margin: "0 auto" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--nook-space-2)" }}>
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
        </div>
        {/* CARDS LIST / WALL */}
        <div style={{ padding: "var(--nook-space-5)"}}>
            <Wall 
                cards={cards} 
                draftCard={draftCard} 
                onUpdate={handleUpdateCard} 
                onDelete={handleDeleteCard} 
                onCreate={handleCreateDraft} 
                onCommitDraft={handleCommitDraft}
                onCancelDraft={handleCancelDraft}
                selectedCardIds={selectedCardIds}
                onToggleCardSelection={toggleCardSelection}
            />
            {selectedCardIds.length > 0 && (
                <SelectionToolbar
                    selectedCount={selectedCardIds.length}
                    onFindInsight={handleFindInsight}
                    onClearSelection={handleClearSelection}
                />
            )}
        </div>
    </div>
    );
};
