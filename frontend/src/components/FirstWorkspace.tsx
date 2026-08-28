import { useState } from "react";

interface FirstWorkspaceProps {
    userName: string;
    onCreate: (name: string) => Promise<void>;
}

export default function FirstWorkspace({
    userName,
    onCreate,
}: FirstWorkspaceProps) {
    const [name, setName] = useState("Personal");
    const [isCreating, setIsCreating] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const trimmedName = name.trim();

        if (!trimmedName || isCreating) return;

        setIsCreating(true);

        try {
            await onCreate(trimmedName);
        } finally {
            setIsCreating(false);
        }
    }

    return (
        <section className="nook-first-workspace">
            <div className="nook-first-workspace__card">
                <p className="nook-first-workspace__eyebrow">
                    YOUR FIRST SPACE
                </p>

                <h1>Welcome, {userName}.</h1>

                <p className="nook-first-workspace__headline">
                    Give your thoughts somewhere to land.
                </p>

                <p>
                    Create a space for the ideas, resources, and things
                    worth returning to.
                </p>

                <form onSubmit={handleSubmit}>
                    <label htmlFor="workspace-name">
                        Workspace name
                    </label>

                    <input
                        id="workspace-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Personal"
                        autoFocus
                    />

                    <button
                        type="submit"
                        disabled={!name.trim() || isCreating}
                    >
                        {isCreating
                            ? "Creating…"
                            : "Create workspace"}
                    </button>
                </form>
            </div>
        </section>
    );
}