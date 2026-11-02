interface InsightPanelProps {
    selectedCount?: number;
    onClose: () => void;
}

export default function InsightPanel({
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
                <p className="nook-insight-panel__working">
                    working right now
                </p>
            </section>
        </aside>
    );
}
