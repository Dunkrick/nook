import WorkspaceSwitcher from "./WorkspaceSwitcher";
import type { Workspace } from "../services/workspaces";

interface FloatingToolbarProps {
    userName: string;
    activeWorkspace: Workspace | null;
    workspaces: Workspace[];

    onWorkspaceChange: (workspace: Workspace) => void;
    onCreateWorkspace: (name: string) => Promise<void>;
    onLogout: () => void;
}

export default function FloatingToolbar({
    userName,
    activeWorkspace,
    workspaces,
    onWorkspaceChange,
    onCreateWorkspace,
    onLogout,
}: FloatingToolbarProps) {
    return (
        <header className="nook-toolbar">
            <div className="nook-toolbar__brand">
                Nook
            </div>

            <WorkspaceSwitcher
                workspaces={workspaces}
                activeWorkspace={activeWorkspace}
                onChange={onWorkspaceChange}
                onCreate={onCreateWorkspace}
            />

            <div
                className="nook-toolbar__divider"
                aria-hidden="true"
            />

            <div className="nook-toolbar__account">
                {userName}
            </div>

            <button
                type="button"
                className="nook-button nook-button--quiet nook-toolbar__button"
                onClick={onLogout}
            >
                Logout
            </button>
        </header>
    );
}