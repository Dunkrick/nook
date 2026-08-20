import { useEffect, useState } from "react";
import SelectionToolbar from "../components/SelectionToolbar"
import { getArtifacts, createArtifact, updateArtifact, deleteArtifact } from "../services/artifacts";
import type { TextArtifact, ArtifactUpdate, DraftArtifact, Position } from "../types/artifacts";
import Wall from "../components/Wall"
import InsightPanel from "../components/InsightPanel";
import WorkspaceShell from "../components/WorkspaceShell";
import FloatingToolbar from "../components/FloatingToolbar";
import { logout } from "../services/auth";
import Viewport from "../components/Viewport";
import World from "../components/World";
import { useNavigate } from "react-router-dom";

export default function Home() {
    const navigate = useNavigate();
    const [artifacts, setArtifacts] = useState<TextArtifact[]>([]);
    const [draftArtifact, setDraftArtifact] = useState<DraftArtifact | null>(null);
    const [selectedArtifactIds, setSelectedArtifactIds] = useState<number[]>([]);
    const [isInsightOpen, setIsInsightOpen] = useState(false);

    function handleCreateDraft(position: Position) {
        setDraftArtifact({
            text: "",
            x: position.x,
            y: position.y,
        });
    }

    async function handleCommitDraft(text: string) {
    if (!draftArtifact) return;

    const savedArtifact = await createArtifact({
        text,
        x: draftArtifact.x,
        y: draftArtifact.y,
    });

    setArtifacts((current) => [...current, savedArtifact]);
    setDraftArtifact(null);
    }

    function handleCancelDraft() {
    setDraftArtifact(null);
    }
    
    useEffect(() => {
        async function fetchArtifacts() {
            const fetchedArtifacts = await getArtifacts();
            setArtifacts(fetchedArtifacts);
        }
        fetchArtifacts();
    }, []);

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
