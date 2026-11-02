import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import TintPicker from "./TintPicker";

describe("TintPicker", () => {
    it("renders all tint options including default", () => {
        const onSelectTint = vi.fn();
        render(<TintPicker currentTint="sky" onSelectTint={onSelectTint} />);

        const group = screen.getByRole("radiogroup", { name: "Paper tint" });
        expect(group).toBeInTheDocument();

        const radios = screen.getAllByRole("radio");
        expect(radios).toHaveLength(7);
    });

    it("marks the active tint as checked", () => {
        const onSelectTint = vi.fn();
        render(<TintPicker currentTint="sky" onSelectTint={onSelectTint} />);

        const skyRadio = screen.getByRole("radio", { name: "Sky" });
        expect(skyRadio).toHaveAttribute("aria-checked", "true");

        const defaultRadio = screen.getByRole("radio", { name: "Default" });
        expect(defaultRadio).toHaveAttribute("aria-checked", "false");
    });

    it("triggers onSelectTint when clicking a tint option", () => {
        const onSelectTint = vi.fn();
        render(<TintPicker currentTint="cream" onSelectTint={onSelectTint} />);

        const roseRadio = screen.getByRole("radio", { name: "Rose" });
        fireEvent.click(roseRadio);

        expect(onSelectTint).toHaveBeenCalledWith("rose");
    });

    it("triggers onSelectTint with null when selecting default", () => {
        const onSelectTint = vi.fn();
        render(<TintPicker currentTint="sage" onSelectTint={onSelectTint} />);

        const defaultRadio = screen.getByRole("radio", { name: "Default" });
        fireEvent.click(defaultRadio);

        expect(onSelectTint).toHaveBeenCalledWith(null);
    });
});

