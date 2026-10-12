import { useEffect, useRef, type PropsWithChildren } from "react";
import { useCanvasCamera } from "../hooks/useCanvasCamera";

export default function Viewport({
    children,
}: PropsWithChildren){

    const camera = useCanvasCamera();
    const viewportRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

        const handleWheel = (event: WheelEvent) => camera.handleWheel(event);

        viewport.addEventListener("wheel", handleWheel, { passive: false });
        return () => viewport.removeEventListener("wheel", handleWheel);
    }, [camera.handleWheel]);

    return(

        <div
            ref={viewportRef}
            className={`nook-viewport${camera.isPanning ? " nook-viewport--panning" : ""}${camera.isSpacePressed ? " nook-viewport--pan-ready" : ""}`}
            onPointerDown={camera.startPan}
            onPointerMove={camera.movePan}
            onPointerUp={camera.endPan}
            onPointerCancel={camera.endPan}
        >

            {children}
            <p className="nook-viewport__hint" aria-hidden="true">Hold space to pan · scroll to zoom</p>

        </div>

    );

}
