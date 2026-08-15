interface FloatingToolbarProps {
    onLogout: () => void;
}

export default function FloatingToolbar({
    onLogout,
}: FloatingToolbarProps) {

    return (
        <header className="nook-toolbar">

            <div className="nook-toolbar__brand">
                <span className="nook-logo">
                    Nook
                    <span className="nook-logo__spark" />
                </span>
            </div>

            <button
                className="nook-toolbar__button"
                onClick={onLogout}
            >
                Logout
            </button>

        </header>
    );
}