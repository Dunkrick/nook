import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ColorDashboard from "./ColorDashboard";

describe("ColorDashboard", () => {
    it("renders all 7 tint options and disabled state when no thoughts are selected", () => {
        const onSelectTint = vi.fn();
        render(
            <ColorDashboard
                selectedCount={0}
                onSelectTint={onSelectTint}
            />
        );

        const group = screen.getByRole("radiogroup", { name: "Paper tint options" });
        expect(group).toBeInTheDocument();

        const radios = screen.getAllByRole("radio");
        expect(radios).toHaveLength(7);
        radios.forEach((radio) => {
            expect(radio).toBeDisabled();
        });

        expect(screen.getByText("Select thought")).toBeInTheDocument();
    });

    it("displays count and enables swatches when thoughts are selected", () => {
        const onSelectTint = vi.fn();
        render(
            <ColorDashboard
                selectedCount={2}
                onSelectTint={onSelectTint}
            />
        );

        expect(screen.getByText("2 thoughts")).toBeInTheDocument();
        const radios = screen.getAllByRole("radio");
        radios.forEach((radio) => {
            expect(radio).toBeEnabled();
        });
    });

    it("marks the active tint as checked", () => {
        const onSelectTint = vi.fn();
        render(
            <ColorDashboard
                selectedCount={1}
                currentTint="sky"
                onSelectTint={onSelectTint}
            />
        );

        const skyRadio = screen.getByRole("radio", { name: "Sky" });
        expect(skyRadio).toHaveAttribute("aria-checked", "true");

        const defaultRadio = screen.getByRole("radio", { name: "Default" });
        expect(defaultRadio).toHaveAttribute("aria-checked", "false");
    });

    it("triggers onSelectTint when clicking a swatch", () => {
        const onSelectTint = vi.fn();
        render(
            <ColorDashboard
                selectedCount={1}
                currentTint="cream"
                onSelectTint={onSelectTint}
            />
        );

        const roseRadio = screen.getByRole("radio", { name: "Rose" });
        fireEvent.click(roseRadio);

        expect(onSelectTint).toHaveBeenCalledWith("rose");
    });

    it("triggers onSelectTint with null when selecting default", () => {
        const onSelectTint = vi.fn();
        render(
            <ColorDashboard
                selectedCount={1}
                currentTint="sage"
                onSelectTint={onSelectTint}
            />
        );

        const defaultRadio = screen.getByRole("radio", { name: "Default" });
        fireEvent.click(defaultRadio);

        expect(onSelectTint).toHaveBeenCalledWith(null);
    });

    it("does not trigger onSelectTint when clicking while disabled", () => {
        const onSelectTint = vi.fn();
        render(
            <ColorDashboard
                selectedCount={0}
                onSelectTint={onSelectTint}
            />
        );

        const skyRadio = screen.getByRole("radio", { name: "Sky" });
        fireEvent.click(skyRadio);

        expect(onSelectTint).not.toHaveBeenCalled();
    });
});
