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

export interface CameraFrameOptions {
    padding?: number;
    paddingTop?: number;
    paddingBottom?: number;
    paddingLeft?: number;
    paddingRight?: number;
    maxZoom?: number;
    minZoom?: number;
    workspaceHome?: { x: number; y: number };
}

export const EMPTY_WORKSPACE_CARDS: ArtifactCardLayout[] = [
    { x: -270, y: -245, width: 340, height: 240 },
    { x: 340, y: 170, width: 275, height: 180 },
];

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

    // Normal workspace thoughts can be placed across the canvas. A generous
    // threshold preserves all user thoughts while filtering extreme outliers.
    return Math.max(median * 4, 2500);
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
    options: CameraFrameOptions = {},
): CameraFrame {
    const defaultPadding = options.padding ?? 64;
    const paddingTop = options.paddingTop ?? defaultPadding;
    const paddingBottom = options.paddingBottom ?? defaultPadding;
    const paddingLeft = options.paddingLeft ?? defaultPadding;
    const paddingRight = options.paddingRight ?? defaultPadding;

    const availableWidth = Math.max(1, viewport.width - (paddingLeft + paddingRight));
    const availableHeight = Math.max(1, viewport.height - (paddingTop + paddingBottom));

    let targetCards = cards;
    if (cards.length === 0) {
        const home = options.workspaceHome ?? { x: 0, y: 0 };
        targetCards = EMPTY_WORKSPACE_CARDS.map((card) => ({
            ...card,
            x: card.x + home.x,
            y: card.y + home.y,
        }));
    }

    const cluster = getMainArtifactCluster(targetCards);
    const minX = Math.min(...cluster.map((card) => card.x));
    const maxX = Math.max(...cluster.map((card) => card.x + card.width));
    const minY = Math.min(...cluster.map((card) => card.y));
    const maxY = Math.max(...cluster.map((card) => card.y + card.height));

    const contentWidth = Math.max(1, maxX - minX);
    const contentHeight = Math.max(1, maxY - minY);
    const boundingCenter = {
        x: (minX + maxX) / 2,
        y: (minY + maxY) / 2,
    };

    const maxZoom = Math.min(1, options.maxZoom ?? 1);
    const minZoom = options.minZoom ?? 0.1;
    const fitZoom = Math.min(
        maxZoom,
        availableWidth / contentWidth,
        availableHeight / contentHeight,
    );
    const zoom = Math.max(minZoom, fitZoom);

    // Shift center to compensate for asymmetric UI chrome (e.g. toolbar at top, palette at left)
    // so the bounding box is visually centered in the remaining clear area.
    const center = {
        x: boundingCenter.x - ((paddingLeft - paddingRight) / 2) / zoom,
        y: boundingCenter.y - ((paddingTop - paddingBottom) / 2) / zoom,
    };

    return { center, zoom };
}

export function getArtifactCenter(artifacts: Artifact[]) {
    if (artifacts.length === 0) return { x: 0, y: 0 };

    const cards = artifacts.map((artifact) => {
        const size = getArtifactCardSize(artifact);
        return { x: artifact.x, y: artifact.y, ...size };
    });
    const cluster = getMainArtifactCluster(cards);
    const minX = Math.min(...cluster.map((card) => card.x));
    const maxX = Math.max(...cluster.map((card) => card.x + card.width));
    const minY = Math.min(...cluster.map((card) => card.y));
    const maxY = Math.max(...cluster.map((card) => card.y + card.height));

    return {
        x: (minX + maxX) / 2,
        y: (minY + maxY) / 2,
    };
}
