interface InsightPanelProps {
    selectedCount?: number;
    onClose: () => void;
}

export default function InsightPanel({
    selectedCount,
    onClose,
}: InsightPanelProps) {
    return (
        <aside className="nook-insight-panel" aria-label="Thought insights">
            <header className="nook-insight-panel__header">
                <div>
                    <span className="nook-insight-panel__eyebrow">pattern finder</span>
                    <h2>What stands out</h2>
                </div>
                <button
                    type="button"
                    className="nook-button nook-button--quiet"
                    onClick={onClose}
                >
                    Close
                </button>
            </header>
            <section className="nook-insight-panel__status">
                <div className="nook-insight-panel__working">
                    <span className="nook-insight-panel__beacon" aria-hidden="true" />
                    <span>working right now</span>
                </div>
                <p className="nook-insight-panel__working-hint">
                    {selectedCount && selectedCount > 0
                        ? `Scanning ${selectedCount} selected thought${selectedCount > 1 ? "s" : ""} for patterns.`
                        : "Scanning thoughts for patterns."}
                </p>
            </section>
        </aside>
    );
}
