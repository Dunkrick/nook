import { useState } from "react";
import type { Workspace } from "../services/workspaces";

interface WorkspaceSwitcherProps {
    workspaces: Workspace[];
    activeWorkspace: Workspace | null;
    onChange: (workspace: Workspace) => void;
    onCreate: (name: string) => Promise<void>;
    onRename?: (workspaceId: number, name: string) => Promise<void>;
}

export default function WorkspaceSwitcher({
    workspaces,
    activeWorkspace,
    onChange,
    onCreate,
    onRename,
}: WorkspaceSwitcherProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [workspaceName, setWorkspaceName] = useState("");
    const [editingWorkspaceId, setEditingWorkspaceId] = useState<number | null>(null);
    const [editingName, setEditingName] = useState("");
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

    async function handleRenameSubmit(e: React.FormEvent) {
        e.preventDefault();

        const trimmedName = editingName.trim();
        if (!trimmedName || !editingWorkspaceId || !onRename || isSubmitting) return;

        setIsSubmitting(true);

        try {
            await onRename(editingWorkspaceId, trimmedName);
            setEditingWorkspaceId(null);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="nook-workspace-switcher">
            <button
                type="button"
                className="nook-workspace-switcher__trigger"
                aria-expanded={isOpen}
                aria-controls="workspace-switcher-menu"
                onClick={() => setIsOpen((open) => !open)}
            >
                <span className="nook-workspace-switcher__name">
                    {activeWorkspace?.name}
                </span>

                <span
                    className="nook-workspace-switcher__chevron"
                    aria-hidden="true"
                >
                    ⌄
                </span>
            </button>

            {isOpen && (
                <div
                    id="workspace-switcher-menu"
                    className="nook-workspace-switcher__menu"
                    aria-label="Choose workspace"
                >
                    <p>Your places</p>

                    {workspaces.map((workspace) =>
                        editingWorkspaceId === workspace.id ? (
                            <form
                                key={workspace.id}
                                className="nook-workspace-switcher__rename"
                                onSubmit={handleRenameSubmit}
                            >
                                <input
                                    autoFocus
                                    value={editingName}
                                    onChange={(e) =>
                                        setEditingName(e.target.value)
                                    }
                                    onKeyDown={(e) => {
                                        if (e.key === "Escape") {
                                            e.preventDefault();
                                            setEditingWorkspaceId(null);
                                        }
                                    }}
                                    placeholder="Workspace name"
                                    aria-label="Rename workspace"
                                />

                                <div>
                                    <button
                                        type="submit"
                                        disabled={
                                            !editingName.trim() || isSubmitting
                                        }
                                    >
                                        {isSubmitting ? "Saving…" : "Save"}
                                    </button>

                                    <button
                                        type="button"
                                        disabled={isSubmitting}
                                        onClick={() =>
                                            setEditingWorkspaceId(null)
                                        }
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div
                                key={workspace.id}
                                className="nook-workspace-switcher__item"
                            >
                                <button
                                    type="button"
                                    className="nook-workspace-switcher__option"
                                    data-active={
                                        workspace.id === activeWorkspace?.id ||
                                        undefined
                                    }
                                    onClick={() => {
                                        onChange(workspace);
                                        setIsOpen(false);
                                    }}
                                >
                                    <span
                                        className="nook-workspace-switcher__mark"
                                        aria-hidden="true"
                                    />

                                    <span className="nook-workspace-switcher__item-name">
                                        {workspace.name}
                                    </span>
                                </button>

                                {onRename && (
                                    <button
                                        type="button"
                                        className="nook-workspace-switcher__action"
                                        title={`Rename ${workspace.name}`}
                                        aria-label={`Rename ${workspace.name}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingWorkspaceId(workspace.id);
                                            setEditingName(workspace.name);
                                            setIsCreating(false);
                                        }}
                                    >
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            aria-hidden="true"
                                            className="nook-workspace-switcher__icon"
                                        >
                                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                            <path d="m15 5 4 4" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        )
                    )}

                    {!isCreating && (
                        <button
                            type="button"
                            className="nook-workspace-switcher__new"
                            onClick={() => {
                                setIsCreating(true);
                                setEditingWorkspaceId(null);
                            }}
                        >
                            + New space
                        </button>
                    )}

                    {isCreating && (
                        <form
                            className="nook-workspace-switcher__create"
                            onSubmit={handleCreate}
                        >
                            <input
                                autoFocus
                                value={workspaceName}
                                onChange={(e) =>
                                    setWorkspaceName(e.target.value)
                                }
                                onKeyDown={handleCreateKeyDown}
                                placeholder="Workspace name"
                                aria-label="New workspace name"
                            />

                            <div>
                                <button
                                    type="submit"
                                    disabled={
                                        !workspaceName.trim() ||
                                        isSubmitting
                                    }
                                >
                                    {isSubmitting
                                        ? "Creating…"
                                        : "Create"}
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
