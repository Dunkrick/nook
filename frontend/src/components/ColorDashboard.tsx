import { useState } from "react";
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
    const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);
    const isTargeted = selectedCount > 0;

    const activeLabel =
        TINT_OPTIONS.find((option) => option.key === (currentTint ?? null))?.label ??
        "Default";

    const subtitle = hoveredLabel
        ? hoveredLabel
        : isTargeted
            ? `${selectedCount} thought${selectedCount !== 1 ? "s" : ""}`
            : activeLabel;

    function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
        if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
        e.preventDefault();

        const currentIndex = TINT_OPTIONS.findIndex(
            (option) => option.key === (currentTint ?? null)
        );
        const nextIndex =
            e.key === "ArrowDown"
                ? (currentIndex + 1) % TINT_OPTIONS.length
                : (currentIndex - 1 + TINT_OPTIONS.length) % TINT_OPTIONS.length;

        onSelectTint(TINT_OPTIONS[nextIndex].key);
    }

    return (
        <aside
            className="nook-color-dashboard"
            aria-label="Paper stock dashboard"
        >
            <div className="nook-color-dashboard__header">
                <span className="nook-color-dashboard__title">Paper</span>
                <span
                    className="nook-color-dashboard__count"
                    aria-live="polite"
                >
                    {subtitle}
                </span>
            </div>

            <div
                className="nook-color-dashboard__palette"
                role="radiogroup"
                aria-label="Paper tint options"
                onKeyDown={handleKeyDown}
            >
                {TINT_OPTIONS.map(({ key, label }) => {
                    const isActive = (currentTint ?? null) === key;

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
                            title={isTargeted ? `Apply ${label}` : `Default: ${label}`}
                            onMouseEnter={() => setHoveredLabel(label)}
                            onMouseLeave={() => setHoveredLabel(null)}
                            onFocus={() => setHoveredLabel(label)}
                            onBlur={() => setHoveredLabel(null)}
                            onClick={() => onSelectTint(key)}
                        >
                            <span className="nook-color-dashboard__swatch-fill" />
                            {isActive && (
                                <span
                                    className="nook-color-dashboard__swatch-mark"
                                    aria-hidden="true"
                                />
                            )}
                        </button>
                    );
                })}
            </div>
        </aside>
    );
}
