import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ColorDashboard from "./ColorDashboard";

describe("ColorDashboard", () => {
    it("renders all 7 tint options in radiogroup", () => {
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
            expect(radio).toBeEnabled();
        });

        expect(screen.getByText("Default")).toBeInTheDocument();
    });

    it("displays count when thoughts are selected", () => {
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

    it("triggers onSelectTint when clicking a swatch even when selectedCount is 0", () => {
        const onSelectTint = vi.fn();
        render(
            <ColorDashboard
                selectedCount={0}
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

    it("previews tint name on hover and restores subtitle on mouse leave", () => {
        const onSelectTint = vi.fn();
        render(
            <ColorDashboard
                selectedCount={3}
                onSelectTint={onSelectTint}
            />
        );

        expect(screen.getByText("3 thoughts")).toBeInTheDocument();

        const butterRadio = screen.getByRole("radio", { name: "Butter" });
        fireEvent.mouseEnter(butterRadio);

        expect(screen.getByText("Butter")).toBeInTheDocument();

        fireEvent.mouseLeave(butterRadio);
        expect(screen.getByText("3 thoughts")).toBeInTheDocument();
    });

    it("supports keyboard arrow navigation across swatches", () => {
        const onSelectTint = vi.fn();
        render(
            <ColorDashboard
                selectedCount={1}
                currentTint={null}
                onSelectTint={onSelectTint}
            />
        );

        const group = screen.getByRole("radiogroup", { name: "Paper tint options" });
        fireEvent.keyDown(group, { key: "ArrowDown" });

        // TINT_OPTIONS[1] is cream
        expect(onSelectTint).toHaveBeenCalledWith("cream");
    });
});
