import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { logout } from "../services/auth";
import { getDreams, createDream, type Dream } from "../services/dreams";
import "../assets/dreamwall-tokens.css";

export default function Home() {
    const navigate = useNavigate();
    const [dreams, setDreams] = useState<Dream[]>([]);
    const [newDreamText, setNewDreamText] = useState("");

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

    return (
    <div style={{ padding: "var(--dw-space-5)", maxWidth: "600px", margin: "0 auto" }}>
        
        {/* HEADER */}
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--dw-space-7)" }}>
            <h1 className="dw-logo">
                <span>Dream</span><span>Wall</span>
            </h1>
            <button 
                className="dw-button-primary" 
                style={{ padding: "var(--dw-space-2) var(--dw-space-4)", fontSize: "var(--dw-text-caption)" }}
                onClick={() => { logout(); navigate("/") }}>
                Logout
            </button>
        </header>

        {/* BLOCK-D: CREATE DREAM FORM (Placeholder for now) */}
        <div style={{ display: "flex", gap: "var(--dw-space-3)", marginBottom: "var(--dw-space-7)" }}>
            <input 
                placeholder="What's your next dream?" 
                style={{ 
                    flex: 1, 
                    padding: "var(--dw-space-3)", 
                    borderRadius: "var(--dw-radius-md)", 
                    border: "1px solid var(--dw-border)",
                    fontFamily: "var(--dw-font-sans)"
                }}
                value={newDreamText} 
                onChange={(e) => setNewDreamText(e.target.value)}
            />
            <button className="dw-button-primary" onClick={handleAddDream}>Add</button>
        </div>

        {/* DREAMS LIST */}
        {dreams.length === 0 ? (
            <div style={{ textAlign: "center", padding: "var(--dw-space-6)", color: "var(--dw-text-primary)" }}>
                <p style={{ fontSize: "var(--dw-text-h3)", fontWeight: "var(--dw-weight-medium)" }}>No dreams yet.</p>
                <p>Time to build some momentum!</p>
            </div>
        ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--dw-space-3)" }}>
                {dreams.map((dream) => (
                    <div 
                        key={dream.id} 
                        style={{ 
                            display: "flex", 
                            alignItems: "center",
                            border: "1px solid var(--dw-border)", 
                            padding: "var(--dw-space-4)", 
                            borderRadius: "var(--dw-radius-md)",
                            background: "white",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
                        }}>
                        <p style={{ margin: 0, color: "var(--dw-text-primary)", fontWeight: "var(--dw-weight-medium)" }}>
                            {dream.text}
                        </p>
                    </div>
                ))}
            </div>
        )}

    </div>
);

}