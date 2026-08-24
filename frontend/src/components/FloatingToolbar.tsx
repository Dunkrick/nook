interface FloatingToolbarProps {
    onLogout: () => void;
}

export default function FloatingToolbar({
    onLogout,
}: FloatingToolbarProps) {
    return (
        <header className="nook-toolbar">
            <button
                className="nook-button nook-button--quiet nook-toolbar__button"
                onClick={onLogout}
            >
                Logout
            </button>

        </header>
    );
}
