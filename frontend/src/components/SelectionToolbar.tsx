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
        <section className="nook-selection-toolbar" aria-label="Selection actions">
            <div className="nook-selection-toolbar__copy">
            <span className="nook-selection-toolbar__count">
                {selectedCount} thought{selectedCount !== 1 ? "s" : ""} selected.
            </span>
            <span className="nook-selection-toolbar__hint">
                Ready to explore them?
            </span>
            </div>
            <button 
                className="nook-button nook-button--primary"
                onClick={onFindInsight}>
                Find Insight
            </button>
            <button 
                className="nook-button nook-button--quiet"
                onClick={onClearSelection}>
                Clear
            </button>
        </section>
    );
}
