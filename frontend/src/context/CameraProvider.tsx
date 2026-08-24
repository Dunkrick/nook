import type { PropsWithChildren } from "react";
import useCamera from "../hooks/useCamera";
import { CameraContext } from "./CameraContext";

export function CameraProvider({ children }: PropsWithChildren) {
    const camera = useCamera();

    return <CameraContext.Provider value={camera}>{children}</CameraContext.Provider>;
}
