import type { PropsWithChildren } from "react";
import { useCanvasCamera } from "../hooks/useCanvasCamera";

export default function World({
    children,
}: PropsWithChildren) {

    const camera = useCanvasCamera();

    return (
        <div
            className="nook-world"
            style={{
                transform: `
                    translate(${camera.x}px, ${camera.y}px)
                    scale(${camera.zoom})
                `,
                transformOrigin: "0 0",
            }}
        >
            {children}
        </div>
    );
}