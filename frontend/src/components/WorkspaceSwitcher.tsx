import { useState } from "react";
import type { Workspace } from "../services/workspaces";

interface WorkspaceSwitcherProps {
    workspaces: Workspace[];
    activeWorkspace: Workspace | null;
    onChange: (workspace: Workspace) => void;
    onCreate: (name: string) => Promise<void>;
}

export default function WorkspaceSwitcher({
    workspaces,
    activeWorkspace,
    onChange,
    onCreate,
}: WorkspaceSwitcherProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [workspaceName, setWorkspaceName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    function handleCreateKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
        e.preventDefault();
        setWorkspaceName("");
        setIsCreating(false);
    }
    }

    async function handleCreate(e: React.FormEvent) {
    e.preventDefault();

    const trimmedName = workspaceName.trim();

    if (!trimmedName || isSubmitting) return;

    setIsSubmitting(true);

    try {
        await onCreate(trimmedName);
        setWorkspaceName("");
        setIsCreating(false);
    } finally {
        setIsSubmitting(false);
    }
}

    return (
        <div className="nook-workspace-identity">
            <button
                type="button"
                className="nook-workspace-identity__trigger"
                aria-expanded={isOpen}
                aria-controls="workspace-switcher-menu"
                onClick={() => setIsOpen((open) => !open)}
            >
                <span>{activeWorkspace?.name}</span>
                <span className="nook-workspace-identity__chevron" aria-hidden="true">⌄</span>
            </button>

            {isOpen && (
                <div
                    id="workspace-switcher-menu"
                    className="nook-workspace-identity__menu"
                    aria-label="Choose workspace"
                >
                    <p>Your places</p>
                    {workspaces.map((workspace) => (
                        <button
                            type="button"
                            key={workspace.id}
                            className="nook-workspace-identity__option"
                            data-active={workspace.id === activeWorkspace?.id || undefined}
                            onClick={() => {
                                onChange(workspace);
                                setIsOpen(false);
                            }}
                        >
                            <span className="nook-workspace-identity__mark" aria-hidden="true" />
                            {workspace.name}
                        </button>
                    ))}
                    {!isCreating && (
                        <button
                            type="button"
                            className="nook-workspace-identity__new"
                            onClick={() => setIsCreating(true)}
                        >
                            + New space
                        </button>
                    )}

                    {isCreating && (
                        <form
                            className="nook-workspace-identity__create"
                            onSubmit={handleCreate}
                        >
                            <input
                                autoFocus
                                value={workspaceName}
                                onChange={(e) => setWorkspaceName(e.target.value)}
                                onKeyDown={handleCreateKeyDown}
                                placeholder="Workspace name"
                                aria-label="New workspace name"
                            />

                            <div>
                                <button
                                    type="submit"
                                    disabled={!workspaceName.trim() || isSubmitting}
                                >
                                    {isSubmitting ? "Creating…" : "Create"}
                                </button>

                                <button
                                    type="button"
                                    disabled={isSubmitting}
                                    onClick={() => {
                                        setWorkspaceName("");
                                        setIsCreating(false);
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            )}
        </div>
    );
}
