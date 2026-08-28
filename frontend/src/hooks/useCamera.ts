import { useEffect, useRef, useState } from "react";

const MIN_ZOOM = 0.6;
const MAX_ZOOM = 1.6;
const WORLD_SIZE = 100_000;

interface CameraPoint { x: number; y: number; }
interface CameraPosition extends CameraPoint { zoom: number; }

const CAMERA_SETTLE_DURATION = 400;

function easeOutCubic(progress: number) {
    return 1 - Math.pow(1 - progress, 3);
}

export default function useCamera() {
    const [camera, setCamera] = useState({ x: 0, y: 0, zoom: 1 });
    const [isPanning, setIsPanning] = useState(false);
    const [isSpacePressed, setIsSpacePressed] = useState(false);
    const cameraRef = useRef(camera);
    const panStart = useRef<CameraPoint>({ x: 0, y: 0 });
    const cameraStart = useRef<CameraPoint>({ x: 0, y: 0 });
    const cameraAnimation = useRef<number | null>(null);

    useEffect(() => {
        const keyDown = (event: KeyboardEvent) => event.code === "Space" && setIsSpacePressed(true);
        const keyUp = (event: KeyboardEvent) => event.code === "Space" && setIsSpacePressed(false);
        window.addEventListener("keydown", keyDown);
        window.addEventListener("keyup", keyUp);
        return () => {
            window.removeEventListener("keydown", keyDown);
            window.removeEventListener("keyup", keyUp);
        };
    }, []);

    useEffect(() => () => {
        if (cameraAnimation.current !== null) {
            window.cancelAnimationFrame(cameraAnimation.current);
        }
    }, []);

    function clampCameraPosition(x: number, y: number, zoom: number) {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        const scaledWorldWidth = WORLD_SIZE * zoom;
        const scaledWorldHeight = WORLD_SIZE * zoom;

        const minX = viewportWidth - scaledWorldWidth;
        const maxX = 0;

        const minY = viewportHeight - scaledWorldHeight;
        const maxY = 0;

        return {
            x: Math.min(maxX, Math.max(minX, x)),
            y: Math.min(maxY, Math.max(minY, y)),
        };
    }

    function stopCameraAnimation() {
        if (cameraAnimation.current !== null) {
            window.cancelAnimationFrame(cameraAnimation.current);
            cameraAnimation.current = null;
        }
    }

    function updateCamera(nextCamera: CameraPosition) {
        const clamped = clampCameraPosition(
            nextCamera.x,
            nextCamera.y,
            nextCamera.zoom
        );

        const next = {
            ...nextCamera,
            ...clamped,
        };

        cameraRef.current = next;
        setCamera(next);
    }

    function animateCameraTo(target: CameraPosition, duration = CAMERA_SETTLE_DURATION) {
        stopCameraAnimation();

        const start = cameraRef.current;
        const startedAt = performance.now();

        function step(now: number) {
            const progress = Math.min((now - startedAt) / duration, 1);
            const easedProgress = easeOutCubic(progress);

            updateCamera({
                x: start.x + (target.x - start.x) * easedProgress,
                y: start.y + (target.y - start.y) * easedProgress,
                zoom: start.zoom + (target.zoom - start.zoom) * easedProgress,
            });

            if (progress < 1) {
                cameraAnimation.current = window.requestAnimationFrame(step);
            } else {
                cameraAnimation.current = null;
            }
        }

        cameraAnimation.current = window.requestAnimationFrame(step);
    }

    function centerOn(
        point: {
            x: number;
            y: number;
        },
        viewport: {
            width: number;
            height: number;
        },
        options?: {
            animate?: boolean;
        },
    ) {
        const current = cameraRef.current;
        const target = {
            ...current,
            x: viewport.width / 2 - point.x * current.zoom,
            y: viewport.height / 2 - point.y * current.zoom,
        };

        if (options?.animate === false) {
            stopCameraAnimation();
            updateCamera(target);
            return;
        }

        animateCameraTo(target);
    }

    function startPan(event: React.PointerEvent<HTMLDivElement>) {
        if (event.button !== 1 && !(event.button === 0 && isSpacePressed)) return;
        event.preventDefault();
        stopCameraAnimation();
        panStart.current = { x: event.clientX, y: event.clientY };
        cameraStart.current = { x: cameraRef.current.x, y: cameraRef.current.y };
        setIsPanning(true);
        event.currentTarget.setPointerCapture(event.pointerId);
    }

    function movePan(event: React.PointerEvent<HTMLDivElement>) {
        if (!isPanning) return;
        const nextX = cameraStart.current.x + event.clientX - panStart.current.x;
        const nextY = cameraStart.current.y + event.clientY - panStart.current.y;
        const clamped = clampCameraPosition( nextX, nextY, cameraRef.current.zoom );

        updateCamera({
            ...cameraRef.current,
            ...clamped,
        });
    }

    function endPan(event: React.PointerEvent<HTMLDivElement>) {
        if (!isPanning) return;
        setIsPanning(false);
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }
    }

    function zoomAtPoint(event: React.WheelEvent<HTMLDivElement>) {
        stopCameraAnimation();
        const bounds = event.currentTarget.getBoundingClientRect();
        const point = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
        const current = cameraRef.current;
        const zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, current.zoom * (event.deltaY > 0 ? 0.9 : 1.1)));
        const world = { x: (point.x - current.x) / current.zoom, y: (point.y - current.y) / current.zoom };
        const nextX = point.x - world.x * zoom;
        const nextY = point.y - world.y * zoom;

        const clamped = clampCameraPosition( nextX, nextY, zoom );
        updateCamera({ ...clamped, zoom, });
    }

    function screenToWorld(point: CameraPoint, bounds: DOMRect): CameraPoint {
        const current = cameraRef.current;
        return { x: (point.x - bounds.left - current.x) / current.zoom, y: (point.y - bounds.top - current.y) / current.zoom };
    }

    function setInitialPosition(position: CameraPoint) {
        stopCameraAnimation();
        updateCamera({ ...cameraRef.current, ...position });
    }

    return { ...camera, isPanning, isSpacePressed, startPan, movePan, endPan, zoomAtPoint, screenToWorld, setInitialPosition, centerOn };

}
