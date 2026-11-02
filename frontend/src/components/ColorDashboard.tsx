import { cn } from "../lib/cn";
import { TINT_OPTIONS } from "../lib/tints";

interface ColorDashboardProps {
    selectedCount: number;
    currentTint?: string | null;
    onSelectTint: (tint: string | null) => void;
}

export default function ColorDashboard({
    selectedCount,
    currentTint,
    onSelectTint,
}: ColorDashboardProps) {
    const isTargeted = selectedCount > 0;

    return (
        <aside
            className="nook-color-dashboard"
            aria-label="Paper stock dashboard"
        >
            <div className="nook-color-dashboard__header">
                <span className="nook-color-dashboard__title">Paper</span>
                <span className="nook-color-dashboard__count">
                    {isTargeted
                        ? `${selectedCount} thought${selectedCount !== 1 ? "s" : ""}`
                        : "Select thought"}
                </span>
            </div>

            <div
                className="nook-color-dashboard__palette"
                role="radiogroup"
                aria-label="Paper tint options"
            >
                {TINT_OPTIONS.map(({ key, label }) => {
                    const isActive = isTargeted && (currentTint ?? null) === key;

                    return (
                        <button
                            key={label}
                            type="button"
                            className={cn(
                                "nook-color-dashboard__swatch",
                                key === null && "nook-color-dashboard__swatch--default",
                                isActive && "nook-color-dashboard__swatch--active"
                            )}
                            style={
                                key
                                    ? ({ "--swatch-color": `var(--tint-${key})` } as React.CSSProperties)
                                    : undefined
                            }
                            role="radio"
                            aria-checked={isActive}
                            aria-label={label}
                            title={isTargeted ? label : `Select a thought to apply ${label}`}
                            disabled={!isTargeted}
                            onClick={() => onSelectTint(key)}
                        >
                            <span className="nook-color-dashboard__swatch-fill" />
                        </button>
                    );
                })}
            </div>
        </aside>
    );
}
