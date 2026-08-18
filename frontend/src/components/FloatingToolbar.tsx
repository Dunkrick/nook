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
                <span className="nook-toolbar__descriptor">your thinking wall</span>
            </div>

            <button
                className="nook-button nook-button--quiet nook-toolbar__button"
                onClick={onLogout}
            >
                Logout
            </button>

        </header>
    );
}
