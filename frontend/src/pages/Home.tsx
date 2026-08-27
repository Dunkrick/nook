import { useEffect, useState } from "react";
import SelectionToolbar from "../components/SelectionToolbar"
import { createArtifact, updateArtifact, deleteArtifact } from "../services/workspaces";
import type { Artifact, ArtifactUpdate, DraftArtifact, Position } from "../types/artifacts";
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
import { CameraProvider } from "../context/CameraProvider";
import CanvasController from "../components/CanvasController";
import { getWorkspaceHome } from "../lib/workspace";

export default function Home() {
    const navigate = useNavigate();
    const [artifacts, setArtifacts] = useState<Artifact[]>([]);
    const [draftArtifact, setDraftArtifact] = useState<DraftArtifact | null>(null);
    const [selectedArtifactIds, setSelectedArtifactIds] = useState<number[]>([]);
    const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [isInsightOpen, setIsInsightOpen] = useState(false);
    const [creationPosition, setCreationPosition] = useState<Position | null>(null);
    const [isWorkspaceReady, setIsWorkspaceReady] = useState(false);

    function handleCreateDraft(position: Position) {
        setCreationPosition(position);
    }

    function handleSelectArtifactType(
    type: "TEXT" | "LINK"
) {
    if (!creationPosition) return;

    if (type === "TEXT") {
        setDraftArtifact({
            type: "TEXT",
            text: "",
            x: creationPosition.x,
            y: creationPosition.y,
        });
    }

    if (type === "LINK") {
        setDraftArtifact({
            type: "LINK",
            url: "",
            x: creationPosition.x,
            y: creationPosition.y,
        });
    }

    setCreationPosition(null);
}
    function handleCancelCreation() {
    setCreationPosition(null);
}

    async function handleCommitDraftText(text: string) {
        if (!draftArtifact || !activeWorkspace || draftArtifact.type !== "TEXT") return;

        const savedArtifact = await createArtifact(
            activeWorkspace.id,
            {
                type: "TEXT",
                text,
                x: draftArtifact.x,
                y: draftArtifact.y,
            }
        );

        setArtifacts((current) => [...current, savedArtifact]);
        setDraftArtifact(null);
    }

    async function handleCommitDraftLink(url: string) {
        if (!draftArtifact || !activeWorkspace || draftArtifact.type !== "LINK") return;

        const savedArtifact = await createArtifact(
            activeWorkspace.id,
            {
                type: "LINK",
                url,
                x: draftArtifact.x,
                y: draftArtifact.y,
            }
        );

        setArtifacts((current) => [...current, savedArtifact]);
        setDraftArtifact(null);
    }

    function handleCancelDraft() {
    setDraftArtifact(null);
    }
    
    useEffect(() => {
    async function initialize() {
        setIsWorkspaceReady(false);
        const fetchedWorkspaces = await getWorkspaces();
        setWorkspaces(fetchedWorkspaces);
        if (fetchedWorkspaces.length === 0) {
            setArtifacts([]);
            setIsWorkspaceReady(true);
            return;
        }

        const savedWorkspaceId = getActiveWorkspaceId();

        const workspace = fetchedWorkspaces.find((workspace) => workspace.id === savedWorkspaceId) ?? fetchedWorkspaces[0];

        setActiveWorkspace(workspace);
        setActiveWorkspaceId(workspace.id);

        const fetchedArtifacts = await getWorkspaceArtifacts(workspace.id);

        setArtifacts(fetchedArtifacts);
        setIsWorkspaceReady(true);
    }

    initialize();
    }, []);

    useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
        if (e.key !== "Escape") return;

        if (draftArtifact) {
            setDraftArtifact(null);
            return;
        }

        if (creationPosition) {
            setCreationPosition(null);
        }
    }

    window.addEventListener(
        "keydown",
        handleKeyDown
    );

    return () => {
        window.removeEventListener(
            "keydown",
            handleKeyDown
        );
    };
}, [draftArtifact, creationPosition]);

async function handleWorkspaceChange(workspace: Workspace) {
    setIsWorkspaceReady(false);
    setActiveWorkspace(workspace);
    setActiveWorkspaceId(workspace.id);

    setSelectedArtifactIds([]);
    setDraftArtifact(null);
    setCreationPosition(null);

    const fetchedArtifacts = await getWorkspaceArtifacts(workspace.id);

    setArtifacts(fetchedArtifacts);
    setIsWorkspaceReady(true);
}

async function handleUpdateArtifact(id: number, update: ArtifactUpdate) {
    if(!activeWorkspace) return;
    
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
        const updated = await updateArtifact(activeWorkspace.id, id, update);

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
    if(!activeWorkspace) return;
    
    // Call the backend to delete
    await deleteArtifact(activeWorkspace.id, id);
    
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
        <CameraProvider>
            <CanvasController
                artifacts={artifacts}
                workspace={activeWorkspace}
                isReady={isWorkspaceReady}
            />
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
                createPosition={creationPosition}
                onUpdate={handleUpdateArtifact} 
                onDelete={handleDeleteArtifact} 
                onCreate={handleCreateDraft} 
                onSelectArtifactType={handleSelectArtifactType}
                onCancelCreation={handleCancelCreation}
                onCommitDraftText={handleCommitDraftText}
                onCommitDraftLink={handleCommitDraftLink}
                onCancelDraft={handleCancelDraft}
                selectedArtifactIds={selectedArtifactIds}
                onToggleArtifactSelection={toggleArtifactSelection}
                homePosition={getWorkspaceHome(activeWorkspace)}
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
        </CameraProvider>
    );
};
