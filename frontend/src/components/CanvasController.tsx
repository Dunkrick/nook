import { useEffect, useRef } from "react";
import { useCanvasCamera } from "../hooks/useCanvasCamera";
import { getArtifactCardSize, getCameraFrame } from "../lib/canvas";
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

        const cards = artifacts.map((artifact) => {
            const element = document.querySelector<HTMLElement>(
                `[data-artifact-id="${artifact.id}"]`,
            );
            const size = element
                ? { width: element.offsetWidth, height: element.offsetHeight }
                : getArtifactCardSize(artifact);

            return { x: artifact.x, y: artifact.y, ...size };
        });
        const cameraFrame = getCameraFrame(
            cards,
            { width: window.innerWidth, height: window.innerHeight },
        );
        const logicalCenter = artifacts.length === 0
            ? getWorkspaceHome(workspace)
            : cameraFrame.center;
        const zoom = artifacts.length === 0 ? 1 : cameraFrame.zoom;

        const renderCenter =
            toRenderPosition(logicalCenter);

        // Start close to home, then settle into it. This makes entering a
        // workspace feel like arriving at a place instead of a camera jump.
        camera.setInitialPosition({
            x: window.innerWidth / 2 - renderCenter.x * zoom + 54,
            y: window.innerHeight / 2 - renderCenter.y * zoom + 36,
            zoom,
        });

        const frame = window.requestAnimationFrame(() => {
            camera.centerOn(renderCenter, {
                width: window.innerWidth,
                height: window.innerHeight,
            }, { zoom });
        });

        focusedWorkspaceId.current = workspace.id;

        return () => window.cancelAnimationFrame(frame);
    }, [artifacts, camera, isReady, workspace]);

    return null;
}
