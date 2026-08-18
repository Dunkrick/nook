import type { PropsWithChildren } from "react";

export default function WorkspaceShell({
    children,
}: PropsWithChildren) {
    return (
        <main className="nook-workspace-shell" aria-label="Nook workspace">
            <div className="nook-workspace-content">
                {children}
            </div>
        </main>
    );
}
