import type { ReactNode } from "react";

interface WorkspaceShellProps {
    children: ReactNode;
}

export default function WorkspaceShell({
    children,
}: WorkspaceShellProps) {
    return (
        <main className="nook-workspace-shell">
            <div className="nook-workspace-content">
                {children}
            </div>
        </main>
    );
}