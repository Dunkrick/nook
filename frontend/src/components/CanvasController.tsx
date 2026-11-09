import { useCallback, useEffect, useRef } from "react";
import { useCanvasCamera } from "../hooks/useCanvasCamera";
import { getArtifactCardSize, getCameraFrame } from "../lib/canvas";
import {
    getWorkspaceHome,
    toRenderPosition,
} from "../lib/workspace";
import type { Artifact } from "../types/artifacts";
import type { Workspace } from "../services/workspaces";

const VIEWPORT_INSETS = {
    paddingTop: 84,
    paddingLeft: 84,
    paddingBottom: 64,
    paddingRight: 64,
};

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

    const frameWorkspace = useCallback(
        (animate = true) => {
            if (!workspace) return;

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
                {
                    ...VIEWPORT_INSETS,
                    workspaceHome: getWorkspaceHome(workspace),
                },
            );

            const renderCenter = toRenderPosition(cameraFrame.center);
            const zoom = cameraFrame.zoom;

            if (!animate) {
                // Start close to home, then settle into it. This makes entering a
                // workspace feel like arriving at a place instead of a camera jump.
                camera.setInitialPosition({
                    x: window.innerWidth / 2 - renderCenter.x * zoom + 54,
                    y: window.innerHeight / 2 - renderCenter.y * zoom + 36,
                    zoom,
                });

                const frame = window.requestAnimationFrame(() => {
                    camera.centerOn(
                        renderCenter,
                        {
                            width: window.innerWidth,
                            height: window.innerHeight,
                        },
                        { zoom },
                    );
                });

                return () => window.cancelAnimationFrame(frame);
            }

            camera.centerOn(
                renderCenter,
                {
                    width: window.innerWidth,
                    height: window.innerHeight,
                },
                { zoom, animate: true },
            );
        },
        [artifacts, camera, workspace],
    );

    useEffect(() => {
        if (!workspace || !isReady || focusedWorkspaceId.current === workspace.id) return;

        focusedWorkspaceId.current = workspace.id;
        const cleanup = frameWorkspace(false);
        return () => {
            if (cleanup) cleanup();
        };
    }, [frameWorkspace, isReady, workspace]);

    useEffect(() => {
        if (!workspace || !isReady) return;

        let resizeTimer: ReturnType<typeof setTimeout> | null = null;
        const handleResize = () => {
            if (resizeTimer) clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                frameWorkspace(true);
            }, 150);
        };

        window.addEventListener("resize", handleResize);
        return () => {
            if (resizeTimer) clearTimeout(resizeTimer);
            window.removeEventListener("resize", handleResize);
        };
    }, [frameWorkspace, isReady, workspace]);

    useEffect(() => {
        if (!workspace || !isReady) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && (event.key === "0" || event.code === "Digit0")) {
                const target = event.target as HTMLElement | null;
                if (
                    target &&
                    (target.tagName === "INPUT" ||
                        target.tagName === "TEXTAREA" ||
                        target.isContentEditable)
                ) {
                    return;
                }
                event.preventDefault();
                frameWorkspace(true);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [frameWorkspace, isReady, workspace]);

    return null;
}
