import type { PropsWithChildren } from "react";
import useCamera from "../hooks/useCamera";

export default function World({
    children,
}: PropsWithChildren) {

    const camera = useCamera();

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