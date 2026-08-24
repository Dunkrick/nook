import { useContext } from "react";
import { CameraContext } from "../context/CameraContext";

export function useCanvasCamera() {
    const camera = useContext(CameraContext);

    if (!camera) {
        throw new Error("useCanvasCamera must be used inside CameraProvider");
    }

    return camera;
}
