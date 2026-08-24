import { useEffect, useState } from "react";
import SelectionToolbar from "../components/SelectionToolbar"
import { createArtifact, updateArtifact, deleteArtifact } from "../services/artifacts";
import type { TextArtifact, ArtifactUpdate, DraftArtifact, Position } from "../types/artifacts";
import Wall from "../components/Wall"
import InsightPanel from "../components/InsightPanel";
import WorkspaceShell from "../components/WorkspaceShell";
import FloatingToolbar from "../components/FloatingToolbar";
import { logout } from "../services/auth";
import Viewport from "../components/Viewport";
import World from "../components/World";
import { getWorkspaces, getWorkspaceArtifacts } from "../services/workspaces";
import type { Workspace } from "../services/workspaces";
import { useNavigate } from "react-router-dom";
import WorkspaceSwitcher from "../components/WorkspaceSwitcher";
import { getActiveWorkspaceId, setActiveWorkspaceId } from "../lib/storage";

export default function Home() {
    const navigate = useNavigate();
    const [artifacts, setArtifacts] = useState<TextArtifact[]>([]);
    const [draftArtifact, setDraftArtifact] = useState<DraftArtifact | null>(null);
    const [selectedArtifactIds, setSelectedArtifactIds] = useState<number[]>([]);
    const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [isInsightOpen, setIsInsightOpen] = useState(false);

    function handleCreateDraft(position: Position) {
        setDraftArtifact({
            text: "",
            x: position.x,
            y: position.y,
        });
    }

    async function handleCommitDraft(text: string) {
    if (!draftArtifact || !activeWorkspace) return;

    const savedArtifact = await createArtifact({
        text,
        x: draftArtifact.x,
        y: draftArtifact.y,
        workspaceId: activeWorkspace.id,
    });

    setArtifacts((current) => [...current, savedArtifact]);
    setDraftArtifact(null);
}

    function handleCancelDraft() {
    setDraftArtifact(null);
    }
    
    useEffect(() => {
    async function initialize() {
        const fetchedWorkspaces = await getWorkspaces();
        setWorkspaces(fetchedWorkspaces);
        if (fetchedWorkspaces.length === 0) {
            setArtifacts([]);
            return;
        }

        const savedWorkspaceId = getActiveWorkspaceId();

        const workspace = fetchedWorkspaces.find((workspace) => workspace.id === savedWorkspaceId) ?? fetchedWorkspaces[0];

        setActiveWorkspace(workspace);
        setActiveWorkspaceId(workspace.id);

        const fetchedArtifacts = await getWorkspaceArtifacts(workspace.id);

        setArtifacts(fetchedArtifacts);
    }

    initialize();
    }, []);

async function handleWorkspaceChange(workspace: Workspace) {
    setActiveWorkspace(workspace);
    setActiveWorkspaceId(workspace.id);
    
    setSelectedArtifactIds([]);
    setDraftArtifact(null);

    const fetchedArtifacts = await getWorkspaceArtifacts(workspace.id);

    setArtifacts(fetchedArtifacts);
}

async function handleUpdateArtifact(id: number, update: ArtifactUpdate) {
    // Keep a snapshot in case the request fails
    const previousArtifacts = artifacts;

    // Optimistic UI update
    setArtifacts((current) =>
        current.map((artifact) =>
            artifact.id === id
                ? { ...artifact, ...update }
                : artifact
        )
    );

    try {
        const updated = await updateArtifact(id, update);

        // Synchronize with the server response
        setArtifacts((current) =>
            current.map((artifact) =>
                artifact.id === id ? updated : artifact
            )
        );
    } catch (error) {
        // Roll back if persistence failed
        setArtifacts(previousArtifacts);
        console.error(error);
    }
}

async function handleDeleteArtifact(id: number) {
    // Call the backend to delete
    await deleteArtifact(id);
    
    // Filter it out of our local React state
    setArtifacts((currentArtifacts) => currentArtifacts.filter((artifact) => artifact.id !== id));
}

function toggleArtifactSelection(artifactId: number) {
    setSelectedArtifactIds((current) => {
        const isSelected = current.includes(artifactId);

        if (isSelected) {
            return current.filter((id) => id !== artifactId);
        }

        return [...current, artifactId];
    });
}

function handleClearSelection(){
    setSelectedArtifactIds([]);
}

function handleFindInsight() {
    setIsInsightOpen(true);
}

function handleCloseInsight(){
    setIsInsightOpen(false);
}
    return (
    <div>
        {/* HEADER */}
        <WorkspaceShell>
            <FloatingToolbar
                onLogout={() => {
                    logout();
                    navigate("/");
                }}
            />
            {activeWorkspace && (
                <WorkspaceSwitcher
                    workspaces={workspaces}
                    activeWorkspace={activeWorkspace}
                    onChange={handleWorkspaceChange}
                />
            )}
            <Viewport>
                <World>
                    <Wall 
                artifacts={artifacts} 
                draftArtifact={draftArtifact} 
                onUpdate={handleUpdateArtifact} 
                onDelete={handleDeleteArtifact} 
                onCreate={handleCreateDraft} 
                onCommitDraft={handleCommitDraft}
                onCancelDraft={handleCancelDraft}
                selectedArtifactIds={selectedArtifactIds}
                onToggleArtifactSelection={toggleArtifactSelection}
                    />
                </World>
            </Viewport>
            {selectedArtifactIds.length > 0 && (
                <SelectionToolbar
                    selectedCount={selectedArtifactIds.length}
                    onFindInsight={handleFindInsight}
                    onClearSelection={handleClearSelection}
                />
            )}
            {isInsightOpen && (
                <InsightPanel
                    selectedCount={selectedArtifactIds.length}
                    onClose={handleCloseInsight}
                />
            )}
            </WorkspaceShell>
    </div>
    );
};
