interface SelectionToolbarProps {
    selectedCount: number;
    onFindInsight: () => void;
    onClearSelection: () => void;
}

export default function SelectionToolbar({
    selectedCount,
    onFindInsight,
    onClearSelection
}: SelectionToolbarProps) {
    return (
        <div style={{
            position: "fixed",
            bottom: "var(--nook-space-5)",
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--nook-bg)",
            padding: "var(--nook-space-4)",
            borderRadius: "var(--nook-radius-lg)",
            border: "1px solid var(--nook-border-block)",
            boxShadow: "var(--shadow-floating)",
            display: "flex",
            gap: "var(--nook-space-2)",
            alignItems: "center",
            zIndex: 1000,
            backdropFilter: "blur(10px)",
        }}>
            <span style={{ fontSize: "var(--nook-text-base)" }}>
                {selectedCount} thought{selectedCount !== 1 ? "s" : ""} selected.
            </span>
            <span style={{ fontSize: "var(--nook-text-base)" }}>
                Ready to explore them?
            </span>
            <button 
                className="nook-button-primary" 
                style={{ padding: "var(--nook-space-2) var(--nook-space-4)", fontSize: "var(--nook-text-caption)" }}
                onClick={onFindInsight}>
                Find Insight
            </button>
            <button 
                className="nook-button" 
                style={{ padding: "var(--nook-space-2) var(--nook-space-4)", fontSize: "var(--nook-text-caption)", color: "var(--nook-text-on-block)", background: "transparent", border: "1px solid var(--nook-text-on-block)" }}
                onClick={onClearSelection}>
                <span style={{ fontSize: "var(--nook-text-caption)" }}>Clear</span>
            </button>
        </div>
    );
}