import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import InsightPanel from "./InsightPanel";
import { CameraProvider } from "../context/CameraProvider";
import { askWorkspace } from "../services/workspaces";
import type { Artifact } from "../types/artifacts";

vi.mock("../services/workspaces", () => ({
    askWorkspace: vi.fn(),
}));

const selectedArtifact: Artifact = {
    id: 7,
    userId: 1,
    workspaceId: 3,
    type: "TEXT",
    content: { text: "Launch checklist" },
    x: 0,
    y: 0,
    zIndex: 0,
};

const result = {
    answer: "Staging deploy completed.",
    keyPoints: [{ title: "Deploy", summary: "Staging is live." }],
    evidence: [{ artifactId: 7, reason: "The note records the staging deploy." }],
    unresolvedItems: ["nook/app#12: Add production monitoring"],
};

function renderPanel(onClose = vi.fn(), onEvidenceClick = vi.fn()) {
    return render(
        <CameraProvider>
            <InsightPanel
                workspaceId={3}
                selectedCount={1}
                artifacts={[selectedArtifact]}
                onClose={onClose}
                onEvidenceClick={onEvidenceClick}
            />
        </CameraProvider>,
    );
}

describe("InsightPanel", () => {
    beforeEach(() => vi.clearAllMocks());

    it("waits for explicit Ask action before calling workspace endpoint", async () => {
        vi.mocked(askWorkspace).mockResolvedValue(result);
        renderPanel();

        fireEvent.change(screen.getByRole("textbox", { name: "Your question" }), {
            target: { value: "What happened with launch?" },
        });
        expect(askWorkspace).not.toHaveBeenCalled();
        fireEvent.click(screen.getByRole("button", { name: "Ask" }));

        await waitFor(() => expect(askWorkspace).toHaveBeenCalledWith(3, "What happened with launch?"));
        expect(await screen.findByText("Staging deploy completed.")).toBeInTheDocument();
        expect(screen.getByText("Key points")).toBeInTheDocument();
        expect(screen.getByText("Evidence")).toBeInTheDocument();
        expect(screen.getByText("Unresolved")).toBeInTheDocument();
        expect(screen.getByText("nook/app#12: Add production monitoring")).toBeInTheDocument();
    });

    it("shows request failures and keeps panel closable", async () => {
        vi.mocked(askWorkspace).mockRejectedValue(new Error("Workspace answers are not configured."));
        const onClose = vi.fn();
        renderPanel(onClose);
        fireEvent.change(screen.getByRole("textbox", { name: "Your question" }), {
            target: { value: "Anything unfinished?" },
        });
        fireEvent.click(screen.getByRole("button", { name: "Ask" }));

        expect(await screen.findByRole("alert")).toHaveTextContent("Workspace answers are not configured.");
        fireEvent.click(screen.getByRole("button", { name: "Close" }));
        expect(onClose).toHaveBeenCalledOnce();
    });

    it("keeps Ask disabled when there are no selected artifacts", () => {
        render(
            <CameraProvider>
                <InsightPanel workspaceId={3} selectedCount={0} artifacts={[]} onClose={vi.fn()} onEvidenceClick={vi.fn()} />
            </CameraProvider>,
        );
        expect(screen.getByRole("button", { name: "Ask" })).toBeDisabled();
    });
});
