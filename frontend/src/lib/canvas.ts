import type { Artifact } from "../types/artifacts";

export interface ArtifactCardLayout {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface CameraFrame {
    center: { x: number; y: number };
    zoom: number;
}

const DEFAULT_CARD_SIZE: Record<Artifact["type"], { width: number; height: number }> = {
    TEXT: { width: 380, height: 220 },
    LINK: { width: 380, height: 220 },
    POLAROID: { width: 280, height: 320 },
    GITHUB_ISSUE: { width: 385, height: 240 },
};

function centerOf(card: ArtifactCardLayout) {
    return {
        x: card.x + card.width / 2,
        y: card.y + card.height / 2,
    };
}

function proximityThreshold(cards: ArtifactCardLayout[]) {
    const diagonals = cards
        .map((card) => Math.hypot(card.width, card.height))
        .sort((a, b) => a - b);
    const median = diagonals[Math.floor(diagonals.length / 2)] ?? 0;

    // Neighboring cards can have a modest gap; large coordinate jumps stay
    // outside cluster even when one card has unusual dimensions.
    return median * 1.5;
}

export function getMainArtifactCluster(cards: ArtifactCardLayout[]) {
    if (cards.length <= 1) return cards;

    const threshold = proximityThreshold(cards);
    const remaining = new Set(cards.map((_, index) => index));
    const clusters: ArtifactCardLayout[][] = [];

    while (remaining.size > 0) {
        const first = remaining.values().next().value as number;
        remaining.delete(first);
        const queue = [first];
        const cluster: ArtifactCardLayout[] = [];

        while (queue.length > 0) {
            const currentIndex = queue.shift()!;
            const current = cards[currentIndex];
            cluster.push(current);
            const currentCenter = centerOf(current);

            for (const candidateIndex of remaining) {
                const candidateCenter = centerOf(cards[candidateIndex]);
                if (
                    Math.hypot(
                        currentCenter.x - candidateCenter.x,
                        currentCenter.y - candidateCenter.y,
                    ) <= threshold
                ) {
                    remaining.delete(candidateIndex);
                    queue.push(candidateIndex);
                }
            }
        }

        clusters.push(cluster);
    }

    return clusters.reduce((largest, cluster) =>
        cluster.length > largest.length ? cluster : largest,
    );
}

export function getArtifactCardSize(artifact: Artifact) {
    return DEFAULT_CARD_SIZE[artifact.type];
}

export function getCameraFrame(
    cards: ArtifactCardLayout[],
    viewport: { width: number; height: number },
    options: { padding?: number; maxZoom?: number; minZoom?: number } = {},
): CameraFrame {
    if (cards.length === 0) {
        return { center: { x: 0, y: 0 }, zoom: 1 };
    }

    const cluster = getMainArtifactCluster(cards);
    const centers = cluster.map(centerOf);
    const center = {
        x: centers.reduce((sum, point) => sum + point.x, 0) / centers.length,
        y: centers.reduce((sum, point) => sum + point.y, 0) / centers.length,
    };
    const halfWidth = Math.max(
        ...cluster.map((card) => Math.abs(card.x + card.width - center.x)),
        ...cluster.map((card) => Math.abs(card.x - center.x)),
    );
    const halfHeight = Math.max(
        ...cluster.map((card) => Math.abs(card.y + card.height - center.y)),
        ...cluster.map((card) => Math.abs(card.y - center.y)),
    );
    const padding = options.padding ?? 64;
    const availableWidth = Math.max(1, viewport.width - padding * 2);
    const availableHeight = Math.max(1, viewport.height - padding * 2);
    const maxZoom = Math.min(1, options.maxZoom ?? 1);
    const minZoom = options.minZoom ?? 0.1;
    const fitZoom = Math.min(
        maxZoom,
        availableWidth / (halfWidth * 2),
        availableHeight / (halfHeight * 2),
    );

    return {
        center,
        zoom: Math.max(minZoom, fitZoom),
    };
}

export function getArtifactCenter(artifacts: Artifact[]) {
    if (artifacts.length === 0) return { x: 0, y: 0 };

    const cards = artifacts.map((artifact) => {
        const size = getArtifactCardSize(artifact);
        return { x: artifact.x, y: artifact.y, ...size };
    });
    const cluster = getMainArtifactCluster(cards);
    const centers = cluster.map(centerOf);

    return {
        x: centers.reduce((sum, point) => sum + point.x, 0) / centers.length,
        y: centers.reduce((sum, point) => sum + point.y, 0) / centers.length,
    };
}
