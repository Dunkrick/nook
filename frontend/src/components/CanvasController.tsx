import { useEffect, useRef } from "react";
import { useCanvasCamera } from "../hooks/useCanvasCamera";
import { getArtifactCenter } from "../lib/canvas";
import {
    getWorkspaceHome,
    toRenderPosition,
} from "../lib/workspace";
import type { Artifact } from "../types/artifacts";
import type { Workspace } from "../services/workspaces";

interface Props {
    artifacts: Artifact[];
    workspace: Workspace | null;
    isReady: boolean;
}

export default function CanvasController({
    artifacts,
    workspace,
    isReady,
}: Props) {

    const camera = useCanvasCamera();
    const focusedWorkspaceId = useRef<number | null>(null);

    useEffect(() => {
        if (!workspace || !isReady || focusedWorkspaceId.current === workspace.id) return;

        const logicalCenter =
            artifacts.length === 0
                ? getWorkspaceHome(workspace)
                : getArtifactCenter(artifacts);

        const renderCenter =
            toRenderPosition(logicalCenter);

        // Start close to home, then settle into it. This makes entering a
        // workspace feel like arriving at a place instead of a camera jump.
        camera.setInitialPosition({
            x: window.innerWidth / 2 - renderCenter.x + 54,
            y: window.innerHeight / 2 - renderCenter.y + 36,
        });

        const frame = window.requestAnimationFrame(() => {
            camera.centerOn(renderCenter, {
                width: window.innerWidth,
                height: window.innerHeight,
            });
        });

        focusedWorkspaceId.current = workspace.id;

        return () => window.cancelAnimationFrame(frame);
    }, [artifacts, camera, isReady, workspace]);

    return null;
}
