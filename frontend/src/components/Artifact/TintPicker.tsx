import { cn } from "../../lib/cn";

const TINT_OPTIONS = [
    { key: null, label: "Default" },
    { key: "cream", label: "Cream" },
    { key: "rose", label: "Rose" },
    { key: "sky", label: "Sky" },
    { key: "sage", label: "Sage" },
    { key: "lavender", label: "Lavender" },
    { key: "butter", label: "Butter" },
] as const;

interface TintPickerProps {
    currentTint?: string | null;
    onSelectTint: (tint: string | null) => void;
}

export default function TintPicker({
    currentTint,
    onSelectTint,
}: TintPickerProps) {
    return (
        <div
            className="nook-tint-picker"
            role="radiogroup"
            aria-label="Paper tint"
        >
            {TINT_OPTIONS.map(({ key, label }) => {
                const isActive = (currentTint ?? null) === key;
                return (
                    <button
                        key={label}
                        type="button"
                        className={cn(
                            "nook-tint-picker__dot",
                            key === null && "nook-tint-picker__dot--default",
                            isActive && "nook-tint-picker__dot--active"
                        )}
                        style={
                            key
                                ? ({ "--dot-color": `var(--tint-${key})` } as React.CSSProperties)
                                : undefined
                        }
                        role="radio"
                        aria-checked={isActive}
                        aria-label={label}
                        title={label}
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelectTint(key);
                        }}
                    />
                );
            })}
        </div>
    );
}
