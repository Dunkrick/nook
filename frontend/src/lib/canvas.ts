import type { Artifact } from "../types/artifacts";

export function getArtifactCenter(
    artifacts: Artifact[]
) {
    if (artifacts.length === 0) {
        return {
            x: 0,
            y: 0,
        };
    }

    const minX = Math.min(
        ...artifacts.map(a => a.x)
    );

    const maxX = Math.max(
        ...artifacts.map(a => a.x)
    );

    const minY = Math.min(
        ...artifacts.map(a => a.y)
    );

    const maxY = Math.max(
        ...artifacts.map(a => a.y)
    );

    return {
        x: (minX + maxX) / 2,
        y: (minY + maxY) / 2,
    };
}