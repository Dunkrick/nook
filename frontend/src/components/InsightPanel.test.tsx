import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import InsightPanel from "./InsightPanel";

describe("InsightPanel", () => {
    it("renders pattern finder eyebrow, 'working right now' beacon badge, and scan hint", () => {
        const onClose = vi.fn();
        render(<InsightPanel selectedCount={2} onClose={onClose} />);

        expect(screen.getByText("pattern finder")).toBeInTheDocument();
        expect(screen.getByText("working right now")).toBeInTheDocument();
        expect(screen.getByText("What stands out")).toBeInTheDocument();
        expect(screen.getByText("Scanning 2 selected thoughts for patterns.")).toBeInTheDocument();
    });

    it("triggers onClose when clicking close button", () => {
        const onClose = vi.fn();
        render(<InsightPanel onClose={onClose} />);

        const closeBtn = screen.getByRole("button", { name: "Close" });
        fireEvent.click(closeBtn);

        expect(onClose).toHaveBeenCalledTimes(1);
    });
});
