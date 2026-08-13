import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { logout } from "../services/auth";
import SelectionToolbar from "../components/SelectionToolbar"
import { getCards, createCard, updateCard, deleteCard } from "../services/cards";
import type { Card, CardUpdate, DraftCard, Position } from "../types/cards";
import Wall from "../components/Wall"
import InsightPanel from "../components/InsightPanel";
import "../assets/nook-tokens.css";

export default function Home() {
    const navigate = useNavigate();
    const [cards, setCards] = useState<Card[]>([]);
    const [draftCard, setDraftCard] = useState<DraftCard | null>(null);
    const [selectedCardIds, setSelectedCardIds] = useState<number[]>([]);
    const [isInsightOpen, setIsInsightOpen] = useState(false);

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

async function handleUpdateCard(id: number, update: CardUpdate) {
    // Keep a snapshot in case the request fails
    const previousCards = cards;

    // Optimistic UI update
    setCards((current) =>
        current.map((card) =>
            card.id === id
                ? { ...card, ...update }
                : card
        )
    );

    try {
        const updated = await updateCard(id, update);

        // Synchronize with the server response
        setCards((current) =>
            current.map((card) =>
                card.id === id ? updated : card
            )
        );
    } catch (error) {
        // Roll back if persistence failed
        setCards(previousCards);
        console.error(error);
    }
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
    setIsInsightOpen(true);
}

function handleCloseInsight(){
    setIsInsightOpen(false);
}
    return (
    <main className="nook-canvas">

        <header className="nook-topbar">

            <h1 className="nook-logo">
                Nook
                <span className="nook-logo__spark"></span>
            </h1>

            <button
                className="nook-button-primary"
                onClick={() => {
                    logout();
                    navigate("/");
                }}
            >
                Logout
            </button>

        </header>

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

        {isInsightOpen && (
            <InsightPanel
                selectedCount={selectedCardIds.length}
                onClose={handleCloseInsight}
            />
        )}

    </main>
    );
};
