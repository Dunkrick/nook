interface InsightPanelProps {
    selectedCount: number;
    onClose: () => void;
}

export default function InsightPanel({
    selectedCount,
    onClose,
}: InsightPanelProps) {
    return (
        //we replace the mock insight with real api call to AI
        <aside 
        style={{
            position: "fixed",
            top: 0,
            right: 0,
            width: "420px",
            height: "100vh",
            background: "var(--nook-bg)",
            borderLeft: "1px solid var(--nook-border)",
            padding: "var(--nook-space-6)",
            display: "flex",
            flexDirection: "column",
            boxShadow: "var(--shadow-floating)",
        }}>
            <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--nook-space-6)" }}>
                <h2 className="nook-text-headline" style={{ margin: 0 }}>💡 What Stands Out</h2>
                <button className="nook-button-ghost" style={{ padding: "var(--nook-space-2) var(--nook-space-4)" }} onClick={onClose}>Close</button>
            </header>
            <section style={{ marginBottom: "var(--nook-space-4)" }}>
                <p className="nook-text-caption" style={{ margin: 0 }}>
                    Looking for patterns across {selectedCount} thoughts...
                </p>
            </section>
            <section style={{ marginBottom: "var(--nook-space-5)" }}>
                <p style={{ marginBottom: "var(--nook-space-3)" }}>
                    It seems you're investing in multiple long-term goals simultaneously.
                </p>
                <p>
                    Rather than trying to progress everything today, identify the one task that unlocks the most momentum before switching context.
                </p>
            </section>
            <section style={{ display: "flex", flexDirection: "column", gap: "var(--nook-space-4)", border: "1px solid var(--nook-border)", padding: "var(--nook-space-2)", borderRadius: "var(--nook-radius-md)", backgroundColor: "var(--nook-bg-tertiary)" }}>
                <p className="nook-text-caption" style={{ margin: 0, fontWeight: "var(--nook-weight-medium)" }}>Suggested next step</p>
                <p className="nook-text-caption" style={{ margin: 0 }}>Complete the drag interaction refactor.</p>
            </section>
        </aside>
    );
}