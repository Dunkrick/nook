import { describe, expect, it } from "vitest";
import { getCameraFrame, getMainArtifactCluster } from "./canvas";

describe("canvas spatial framing", () => {
    it("keeps a cluster at zoom one when padding already fits", () => {
        const frame = getCameraFrame(
            [
                { x: 0, y: 0, width: 260, height: 150 },
                { x: 320, y: 0, width: 280, height: 300 },
                { x: 220, y: 360, width: 260, height: 150 },
            ],
            { width: 1111, height: 1003 },
        );

        expect(frame.zoom).toBe(1);
    });

    it("selects largest spatial group and calculates centers from card centers", () => {
        const nearby = [
            { x: 100, y: 100, width: 260, height: 140 },
            { x: 440, y: 100, width: 280, height: 300 },
            { x: 300, y: 420, width: 260, height: 150 },
        ];
        const cards = [
            ...nearby,
            { x: 9000, y: -8000, width: 260, height: 140 },
            { x: -12000, y: 11000, width: 280, height: 300 },
        ];

        const cluster = getMainArtifactCluster(cards);

        expect(cluster).toHaveLength(3);
        const frame = getCameraFrame(cards, { width: 1200, height: 900 });
        const centers = nearby.map((card) => ({
            x: card.x + card.width / 2,
            y: card.y + card.height / 2,
        }));
        expect(frame.center.x).toBeCloseTo(
            centers.reduce((sum, point) => sum + point.x, 0) / centers.length,
        );
        expect(frame.center.y).toBeCloseTo(
            centers.reduce((sum, point) => sum + point.y, 0) / centers.length,
        );
    });

    it("fits selected card bounds with padding and never zooms above one", () => {
        const cards = [
            { x: 100, y: 100, width: 380, height: 260 },
            { x: 700, y: 80, width: 280, height: 320 },
            { x: 420, y: 520, width: 380, height: 220 },
            { x: 30_000, y: 30_000, width: 280, height: 320 },
        ];
        const viewport = { width: 800, height: 600 };
        const padding = 48;
        const frame = getCameraFrame(cards, viewport, { padding });
        const cluster = getMainArtifactCluster(cards);
        const left = Math.min(...cluster.map((card) => card.x));
        const right = Math.max(...cluster.map((card) => card.x + card.width));
        const top = Math.min(...cluster.map((card) => card.y));
        const bottom = Math.max(...cluster.map((card) => card.y + card.height));
        const screenBounds = {
            left: viewport.width / 2 + (left - frame.center.x) * frame.zoom,
            right: viewport.width / 2 + (right - frame.center.x) * frame.zoom,
            top: viewport.height / 2 + (top - frame.center.y) * frame.zoom,
            bottom: viewport.height / 2 + (bottom - frame.center.y) * frame.zoom,
        };

        expect(frame.zoom).toBeLessThanOrEqual(1);
        expect(frame.zoom).toBeGreaterThan(0.1);
        expect(screenBounds.left).toBeGreaterThanOrEqual(padding - 0.001);
        expect(screenBounds.right).toBeLessThanOrEqual(viewport.width - padding + 0.001);
        expect(screenBounds.top).toBeGreaterThanOrEqual(padding - 0.001);
        expect(screenBounds.bottom).toBeLessThanOrEqual(viewport.height - padding + 0.001);
    });
});
