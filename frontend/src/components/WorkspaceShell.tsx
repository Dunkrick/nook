import { useState, type ReactNode } from "react";

interface WorkspaceShellProps {
    children: ReactNode;
}

export default function WorkspaceShell({
    children,
}: WorkspaceShellProps) {

    const [toolbarActive, setToolbarActive] = useState(false);

    return (
        <div
            className="nook-workspace-shell"
            onMouseMove={(e) => setToolbarActive(e.clientY < 100)}
        >
            <div className="nook-workspace-content">
                {children}
            </div>
        </div>
    );
}