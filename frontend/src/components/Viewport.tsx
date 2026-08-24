import { useRef, type PropsWithChildren } from "react";
import { useCanvasCamera } from "../hooks/useCanvasCamera";

export default function Viewport({
    children,
}: PropsWithChildren){

    const camera = useCanvasCamera();
    const viewportRef = useRef<HTMLDivElement>(null);

    return(

        <div
            ref={viewportRef}
            className={`nook-viewport${camera.isPanning ? " nook-viewport--panning" : ""}${camera.isSpacePressed ? " nook-viewport--pan-ready" : ""}`}
            onPointerDown={camera.startPan}
            onPointerMove={camera.movePan}
            onPointerUp={camera.endPan}
            onPointerCancel={camera.endPan}
            onWheel={camera.zoomAtPoint}
        >

            {children}
            <p className="nook-viewport__hint" aria-hidden="true">Hold space to pan · scroll to zoom</p>

        </div>

    );

}
