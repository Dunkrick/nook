interface InsightPanelProps {
    selectedCount: number;
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
                <button className="nook-button nook-button--quiet" onClick={onClose}>Close</button>
            </header>
            <section className="nook-insight-panel__status">
                <p>
                    Looking for patterns across {selectedCount} thoughts...
                </p>
            </section>
            <section className="nook-insight-panel__copy">
                <p>
                    It seems you're investing in multiple long-term goals simultaneously.
                </p>
                <p>
                    Rather than trying to progress everything today, identify the one task that unlocks the most momentum before switching context.
                </p>
            </section>
            <section className="nook-insight-panel__next-step">
                <strong>Suggested next step</strong>
                <p>Choose the one thought that unlocks the most momentum today.</p>
            </section>
        </aside>
    );
}
