export interface TintOption {
    key: string | null;
    label: string;
}

export const TINT_OPTIONS = [
    { key: null, label: "Default" },
    { key: "cream", label: "Cream" },
    { key: "rose", label: "Rose" },
    { key: "sky", label: "Sky" },
    { key: "sage", label: "Sage" },
    { key: "lavender", label: "Lavender" },
    { key: "butter", label: "Butter" },
] as const;
