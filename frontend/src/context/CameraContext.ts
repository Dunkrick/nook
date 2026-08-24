import { createContext } from "react";
import type useCamera from "../hooks/useCamera";

export type CameraControls = ReturnType<typeof useCamera>;

export const CameraContext = createContext<CameraControls | null>(null);
