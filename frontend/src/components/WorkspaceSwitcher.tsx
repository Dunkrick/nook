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
    return (
        <select
            value={activeWorkspace?.id ?? ""}
            onChange={(event) => {
                const workspace = workspaces.find(
                    (workspace) =>
                        workspace.id === Number(event.target.value)
                );

                if (workspace) {
                    onChange(workspace);
                }
            }}
        >
            {workspaces.map((workspace) => (
                <option
                    key={workspace.id}
                    value={workspace.id}
                >
                    {workspace.name}
                </option>
            ))}
        </select>
    );
}