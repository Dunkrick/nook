import type { Position } from "../types/artifacts";
import type { Workspace } from "../services/workspaces";

export interface WorkspaceHome {
    x: number;
    y: number;
}

// Persisted artifact coordinates are measured from this home position. The
// backend can provide a different `center` per workspace later without
// changing the canvas coordinate system.
export const WORKSPACE_ORIGIN: WorkspaceHome = {
    x: 0,
    y: 0,
};

export const DEFAULT_ARTIFACT_OFFSET = {
    x: 360,
    y: 210,
};

export const FIRST_ARTIFACT_POSITION: Position = {
    x: WORKSPACE_ORIGIN.x,
    y: WORKSPACE_ORIGIN.y,
};

export function getWorkspaceHome(workspace: Workspace | null): WorkspaceHome {
    return workspace?.center ?? WORKSPACE_ORIGIN;
}

export function addPlacementVariation(position: Position): Position {
    const variation = () => Math.round((Math.random() - 0.5) * 96);

    return {
        x: position.x + variation(),
        y: position.y + variation(),
    };
}

// The renderer uses a very large physical plane, while persisted artifact
// positions remain small, human-readable coordinates around (0, 0).
export const RENDER_WORLD_SIZE = 100_000;
export const RENDER_WORLD_ORIGIN = RENDER_WORLD_SIZE / 2;

export function toRenderPosition(position: Position ) {
    return {
        x: position.x + RENDER_WORLD_ORIGIN,
        y: position.y + RENDER_WORLD_ORIGIN,
    };
}

export function fromRenderPosition(position: { x: number; y: number }) {
    return {
        x: position.x - RENDER_WORLD_ORIGIN,
        y: position.y - RENDER_WORLD_ORIGIN,
    };
}
