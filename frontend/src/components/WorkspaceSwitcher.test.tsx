import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import WorkspaceSwitcher from "./WorkspaceSwitcher";
import type { Workspace } from "../services/workspaces";

const mockWorkspaces: Workspace[] = [
    { id: 1, name: "Personal", createdAt: "2026-01-01" },
    { id: 2, name: "Research Lab", createdAt: "2026-01-02" },
];

describe("WorkspaceSwitcher", () => {
    it("renders the active workspace name in the trigger", () => {
        render(
            <WorkspaceSwitcher
                workspaces={mockWorkspaces}
                activeWorkspace={mockWorkspaces[0]}
                onChange={vi.fn()}
                onCreate={vi.fn()}
            />
        );

        expect(screen.getByText("Personal")).toBeInTheDocument();
    });

    it("opens the menu and lists workspaces when trigger is clicked", () => {
        render(
            <WorkspaceSwitcher
                workspaces={mockWorkspaces}
                activeWorkspace={mockWorkspaces[0]}
                onChange={vi.fn()}
                onCreate={vi.fn()}
            />
        );

        fireEvent.click(screen.getByRole("button", { name: /Personal/i }));

        expect(screen.getByLabelText("Choose workspace")).toBeInTheDocument();
        expect(screen.getByText("Research Lab")).toBeInTheDocument();
        expect(screen.getByText("+ New space")).toBeInTheDocument();
    });

    it("calls onChange when a different workspace is selected", () => {
        const onChange = vi.fn();
        render(
            <WorkspaceSwitcher
                workspaces={mockWorkspaces}
                activeWorkspace={mockWorkspaces[0]}
                onChange={onChange}
                onCreate={vi.fn()}
            />
        );

        fireEvent.click(screen.getByRole("button", { name: /Personal/i }));
        fireEvent.click(screen.getByText("Research Lab"));

        expect(onChange).toHaveBeenCalledWith(mockWorkspaces[1]);
    });

    it("opens the inline rename form when Rename is clicked", () => {
        render(
            <WorkspaceSwitcher
                workspaces={mockWorkspaces}
                activeWorkspace={mockWorkspaces[0]}
                onChange={vi.fn()}
                onCreate={vi.fn()}
                onRename={vi.fn()}
            />
        );

        fireEvent.click(screen.getByRole("button", { name: /Personal/i }));
        const renameBtn = screen.getByRole("button", { name: "Rename Personal" });
        fireEvent.click(renameBtn);

        const input = screen.getByRole("textbox", { name: "Rename workspace" });
        expect(input).toBeInTheDocument();
        expect(input).toHaveValue("Personal");
        expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    });

    it("calls onRename with updated name on submit", async () => {
        const onRename = vi.fn().mockResolvedValue(undefined);
        render(
            <WorkspaceSwitcher
                workspaces={mockWorkspaces}
                activeWorkspace={mockWorkspaces[0]}
                onChange={vi.fn()}
                onCreate={vi.fn()}
                onRename={onRename}
            />
        );

        fireEvent.click(screen.getByRole("button", { name: /Personal/i }));
        fireEvent.click(screen.getByRole("button", { name: "Rename Personal" }));

        const input = screen.getByRole("textbox", { name: "Rename workspace" });
        fireEvent.change(input, { target: { value: "Personal Notes" } });
        fireEvent.click(screen.getByRole("button", { name: "Save" }));

        expect(onRename).toHaveBeenCalledWith(1, "Personal Notes");
    });

    it("cancels rename mode when Cancel is clicked", () => {
        render(
            <WorkspaceSwitcher
                workspaces={mockWorkspaces}
                activeWorkspace={mockWorkspaces[0]}
                onChange={vi.fn()}
                onCreate={vi.fn()}
                onRename={vi.fn()}
            />
        );

        fireEvent.click(screen.getByRole("button", { name: /Personal/i }));
        fireEvent.click(screen.getByRole("button", { name: "Rename Personal" }));

        expect(screen.getByRole("textbox", { name: "Rename workspace" })).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

        expect(screen.queryByRole("textbox", { name: "Rename workspace" })).not.toBeInTheDocument();
        expect(screen.getAllByText("Personal")).toHaveLength(2);
    });
});
