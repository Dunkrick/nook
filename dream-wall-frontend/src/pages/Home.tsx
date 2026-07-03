import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { logout } from "../services/auth";
import { getDreams, createDream, updateDream, deleteDream,type Dream } from "../services/dreams";
import "../assets/dreamwall-tokens.css";

export default function Home() {
    const navigate = useNavigate();
    const [dreams, setDreams] = useState<Dream[]>([]);
    const [newDreamText, setNewDreamText] = useState("");
    const [editingDreamId, setEditingDreamId] = useState<number | null>(null);
    const [editingDreamText, setEditingDreamText] = useState("");

    useEffect(() => {
        async function fetchDreams() {
            const dreams = await getDreams();
            setDreams(dreams);
        }
        fetchDreams();
    }, []);

    async function handleAddDream() {
    if (!newDreamText.trim()) return; // Don't submit empty strings
    
    // Call our backend
    const savedDream = await createDream(newDreamText);
    
    // Update the UI immediately
    setDreams([...dreams, savedDream]); 
    
    // Clear the input
    setNewDreamText("");
}

async function handleUpdateDream(id: number) {
    if (!editingDreamText.trim()) return;
    
    // Call the backend
    const updated = await updateDream(id, editingDreamText);
    
    // Update the specific dream in our array
    setDreams(dreams.map(d => d.id === id ? updated : d));
    
    // Close edit mode
    setEditingDreamId(null);
}

async function handleDeleteDream(id: number) {
    // Call the backend to delete
    await deleteDream(id);
    
    // Filter it out of our local React state
    setDreams(dreams.filter(d => d.id !== id));
}

    return (
    <div style={{ padding: "var(--dw-space-5)", maxWidth: "600px", margin: "0 auto" }}>
        
        {/* HEADER */}
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--dw-space-7)" }}>
            <h1 className="dw-logo">
                Dreamwall<span className="dw-logo__spark"></span>
            </h1>
            <button 
                className="dw-button-primary" 
                style={{ padding: "var(--dw-space-2) var(--dw-space-4)", fontSize: "var(--dw-text-caption)" }}
                onClick={() => { logout(); navigate("/") }}>
                Logout
            </button>
        </header>

        {/* HERO BLOCK: CREATE DREAM FORM */}
        <div className="dw-hero-block" style={{ marginBottom: "var(--dw-space-7)" }}>
            <h1>What's your next dream?</h1>
            <div style={{ display: "flex", gap: "var(--dw-space-3)" }}>
                <input 
                    placeholder="Type it into reality..." 
                    style={{ 
                        flex: 1, 
                        padding: "var(--dw-space-3)", 
                        borderRadius: "var(--dw-radius-md)", 
                        border: "none",
                        fontFamily: "var(--dw-font-sans)",
                        fontSize: "var(--dw-text-body)"
                    }}
                    value={newDreamText} 
                    onChange={(e) => setNewDreamText(e.target.value)}
                />
                <button className="dw-button-primary" onClick={handleAddDream}>Add</button>
            </div>
        </div>

        {/* DREAMS LIST */}
        {dreams.length === 0 ? (
            <div style={{ textAlign: "center", padding: "var(--dw-space-6)", color: "var(--dw-text-primary)" }}>
                <p style={{ fontSize: "var(--dw-text-h3)", fontWeight: "var(--dw-weight-medium)" }}>No dreams yet.</p>
                <p>Time to build some momentum!</p>
            </div>
        ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--dw-space-4)" }}>
                {dreams.map((dream, index) => {
                    const blockColor = `var(--dw-block-${(index % 4) + 1})`;
                    return (
                        <div 
                            key={dream.id} 
                            className="dw-block"
                            style={{ 
                                display: "flex", 
                                justifyContent: "space-between", 
                                alignItems: "center",
                                background: blockColor
                            }}>
                            
                            {editingDreamId === dream.id ? (
                                // --- EDITING MODE ---
                                <div style={{ display: "flex", gap: "var(--dw-space-2)", width: "100%" }}>
                                    <input 
                                        value={editingDreamText}
                                        onChange={(e) => setEditingDreamText(e.target.value)}
                                        style={{ flex: 1, padding: "var(--dw-space-2)", border: "1px solid var(--dw-border-block)", borderRadius: "var(--dw-radius-sm)", fontFamily: "var(--dw-font-sans)" }}
                                    />
                                    <button className="dw-button-primary" style={{ background: "var(--dw-text-on-block)", color: "var(--dw-bg)" }} onClick={() => handleUpdateDream(dream.id)}>Save</button>
                                    <button onClick={() => setEditingDreamId(null)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--dw-text-on-block)", fontWeight: "var(--dw-weight-bold)" }}>Cancel</button>
                                </div>
                            ) : (
                                // --- NORMAL MODE ---
                                <>
                                    <div style={{ display: "flex", alignItems: "center", gap: "var(--dw-space-4)" }}>
                                        <span className="dw-block__number">{(index + 1).toString().padStart(2, '0')}</span>
                                        <p className="dw-block__label" style={{ margin: 0 }}>
                                            {dream.text}
                                        </p>
                                    </div>
                                    <div style={{ display: "flex", gap: "var(--dw-space-3)" }}>
                                        <button 
                                            onClick={() => {
                                                setEditingDreamId(dream.id);
                                                setEditingDreamText(dream.text);
                                            }}
                                            style={{ background: "transparent", border: "none", color: "var(--dw-text-on-block)", cursor: "pointer", fontWeight: "var(--dw-weight-medium)" }}>
                                            Edit
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteDream(dream.id)}
                                            style={{ background: "transparent", border: "none", color: "var(--dw-text-on-block)", cursor: "pointer", fontWeight: "var(--dw-weight-bold)" }}>
                                            Delete
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        )}

    </div>
);

}