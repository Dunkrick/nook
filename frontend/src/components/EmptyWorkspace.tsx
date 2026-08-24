import { DEFAULT_ARTIFACT_OFFSET, toRenderPosition } from "../lib/workspace";
import type { Position } from "../types/artifacts";

interface EmptyWorkspaceProps {
    home: Position;
}

export default function EmptyWorkspace({ home }: EmptyWorkspaceProps) {
    const primaryPosition = toRenderPosition({
        x: home.x - 270,
        y: home.y - 245,
    });
    const secondaryPosition = toRenderPosition({
        x: home.x + DEFAULT_ARTIFACT_OFFSET.x - 20,
        y: home.y + DEFAULT_ARTIFACT_OFFSET.y - 40,
    });

    return (
        <>
            <div
                className="nook-empty-note nook-empty-note--primary"
                style={{ left: primaryPosition.x, top: primaryPosition.y }}
            >
                <div className="nook-empty-note__eyebrow">
                    A PLACE TO RETURN TO
                </div>

                <h2>Your space is empty.</h2>

                <p>
                    Capture a thought, a memory, or an idea. Double-click
                    anywhere to place your first one at the heart of this space.
                </p>

                <div className="nook-empty-note__seed" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                </div>
            </div>

            <div
                className="nook-empty-note nook-empty-note--secondary"
                style={{ left: secondaryPosition.x, top: secondaryPosition.y }}>
                <div className="nook-empty-note__ghost-line" />
                <div className="nook-empty-note__ghost-line short" />
                <div className="nook-empty-note__ghost-line" />
            </div>
        </>
    );
};
