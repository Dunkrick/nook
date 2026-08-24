import { useState } from "react";
import type { Workspace } from "../services/workspaces";

interface WorkspaceSwitcherProps {
    workspaces: Workspace[];
    activeWorkspace: Workspace | null;
    onChange: (workspace: Workspace) => void;
}

export default function WorkspaceSwitcher({
    workspaces,
    activeWorkspace,
    onChange,
}: WorkspaceSwitcherProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="nook-workspace-identity">
            <span className="nook-workspace-identity__product">
                Nook<span className="nook-logo__spark" />
            </span>

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
                </div>
            )}
        </div>
    );
}
