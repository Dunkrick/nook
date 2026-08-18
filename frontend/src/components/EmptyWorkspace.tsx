import { WORKSPACE_ORIGIN, DEFAULT_CARD_OFFSET } from "../lib/workspace";

export default function EmptyWorkspace() {
    return (
        <>
            <div
                className="nook-empty-note nook-empty-note--primary"
                style={{ left: WORKSPACE_ORIGIN.x, top: WORKSPACE_ORIGIN.y }}
            >
                <div className="nook-empty-note__eyebrow">
                    BEGIN HERE
                </div>

                <h2>Everything starts with one thought.</h2>

                <p>
                    Double-click anywhere on the wall and let the first idea
                    land. It doesn't have to be perfect.
                </p>
            </div>

            <div
                className="nook-empty-note nook-empty-note--secondary"
                style={{ left: WORKSPACE_ORIGIN.x + DEFAULT_CARD_OFFSET.x, top: WORKSPACE_ORIGIN.y + DEFAULT_CARD_OFFSET.y }}>
                <div className="nook-empty-note__ghost-line" />
                <div className="nook-empty-note__ghost-line short" />
                <div className="nook-empty-note__ghost-line" />
            </div>
        </>
    );
};
