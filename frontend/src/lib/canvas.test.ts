import { describe, expect, it } from "vitest";
import {
    EMPTY_WORKSPACE_CARDS,
    getCameraFrame,
    getMainArtifactCluster,
} from "./canvas";

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

    it("selects largest spatial group and calculates center from true bounding box", () => {
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
        const minX = Math.min(...nearby.map((c) => c.x));
        const maxX = Math.max(...nearby.map((c) => c.x + c.width));
        const minY = Math.min(...nearby.map((c) => c.y));
        const maxY = Math.max(...nearby.map((c) => c.y + c.height));

        expect(frame.center.x).toBeCloseTo((minX + maxX) / 2);
        expect(frame.center.y).toBeCloseTo((minY + maxY) / 2);
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

    describe("empty workspace laptop responsiveness", () => {
        const safeInsets = {
            paddingTop: 84,
            paddingLeft: 84,
            paddingBottom: 64,
            paddingRight: 64,
        };

        const targetLaptopViewports = [
            { name: "13.6-inch MacBook Air (1470x956)", width: 1470, height: 956 },
            { name: "13.6-inch MacBook Air scaled (1280x832)", width: 1280, height: 832 },
            { name: "14.2-inch MacBook Pro (1512x982)", width: 1512, height: 982 },
            { name: "Windows 14-inch 150% scaling (1280x720)", width: 1280, height: 720 },
            { name: "Windows 14-inch 125% scaling (1536x864)", width: 1536, height: 864 },
            { name: "Standard laptop 1366x768", width: 1366, height: 768 },
        ];

        targetLaptopViewports.forEach(({ name, width, height }) => {
            it(`fits empty workspace notes within screen on ${name}`, () => {
                const viewport = { width, height };
                const frame = getCameraFrame([], viewport, safeInsets);

                expect(frame.zoom).toBeLessThanOrEqual(1);
                expect(frame.zoom).toBeGreaterThan(0.1);

                const minX = Math.min(...EMPTY_WORKSPACE_CARDS.map((c) => c.x));
                const maxX = Math.max(...EMPTY_WORKSPACE_CARDS.map((c) => c.x + c.width));
                const minY = Math.min(...EMPTY_WORKSPACE_CARDS.map((c) => c.y));
                const maxY = Math.max(...EMPTY_WORKSPACE_CARDS.map((c) => c.y + c.height));

                const screenLeft = viewport.width / 2 + (minX - frame.center.x) * frame.zoom;
                const screenRight = viewport.width / 2 + (maxX - frame.center.x) * frame.zoom;
                const screenTop = viewport.height / 2 + (minY - frame.center.y) * frame.zoom;
                const screenBottom = viewport.height / 2 + (maxY - frame.center.y) * frame.zoom;

                // Empty notes must stay strictly within the visible clear area without scrolling
                expect(screenLeft).toBeGreaterThanOrEqual(safeInsets.paddingLeft - 0.001);
                expect(screenRight).toBeLessThanOrEqual(viewport.width - safeInsets.paddingRight + 0.001);
                expect(screenTop).toBeGreaterThanOrEqual(safeInsets.paddingTop - 0.001);
                expect(screenBottom).toBeLessThanOrEqual(viewport.height - safeInsets.paddingBottom + 0.001);
            });
        });

        it("respects custom workspaceHome offset for empty workspace", () => {
            const home = { x: 500, y: -300 };
            const viewport = { width: 1280, height: 720 };
            const frame = getCameraFrame([], viewport, { ...safeInsets, workspaceHome: home });

            const minX = Math.min(...EMPTY_WORKSPACE_CARDS.map((c) => c.x + home.x));
            const maxX = Math.max(...EMPTY_WORKSPACE_CARDS.map((c) => c.x + home.x + c.width));
            const minY = Math.min(...EMPTY_WORKSPACE_CARDS.map((c) => c.y + home.y));
            const maxY = Math.max(...EMPTY_WORKSPACE_CARDS.map((c) => c.y + home.y + c.height));

            const screenLeft = viewport.width / 2 + (minX - frame.center.x) * frame.zoom;
            const screenRight = viewport.width / 2 + (maxX - frame.center.x) * frame.zoom;
            const screenTop = viewport.height / 2 + (minY - frame.center.y) * frame.zoom;
            const screenBottom = viewport.height / 2 + (maxY - frame.center.y) * frame.zoom;

            expect(screenLeft).toBeGreaterThanOrEqual(safeInsets.paddingLeft - 0.001);
            expect(screenRight).toBeLessThanOrEqual(viewport.width - safeInsets.paddingRight + 0.001);
            expect(screenTop).toBeGreaterThanOrEqual(safeInsets.paddingTop - 0.001);
            expect(screenBottom).toBeLessThanOrEqual(viewport.height - safeInsets.paddingBottom + 0.001);
        });
    });

    describe("populated workspace laptop responsiveness", () => {
        const safeInsets = {
            paddingTop: 84,
            paddingLeft: 84,
            paddingBottom: 64,
            paddingRight: 64,
        };

        it("fits multiple cards spaced across the workspace on smaller 1280x720 display", () => {
            const cards = [
                { x: -400, y: -200, width: 380, height: 220 },
                { x: 100, y: -100, width: 280, height: 320 },
                { x: 300, y: 150, width: 385, height: 240 },
            ];
            const viewport = { width: 1280, height: 720 };
            const frame = getCameraFrame(cards, viewport, safeInsets);

            const minX = Math.min(...cards.map((c) => c.x));
            const maxX = Math.max(...cards.map((c) => c.x + c.width));
            const minY = Math.min(...cards.map((c) => c.y));
            const maxY = Math.max(...cards.map((c) => c.y + c.height));

            const screenLeft = viewport.width / 2 + (minX - frame.center.x) * frame.zoom;
            const screenRight = viewport.width / 2 + (maxX - frame.center.x) * frame.zoom;
            const screenTop = viewport.height / 2 + (minY - frame.center.y) * frame.zoom;
            const screenBottom = viewport.height / 2 + (maxY - frame.center.y) * frame.zoom;

            expect(screenLeft).toBeGreaterThanOrEqual(safeInsets.paddingLeft - 0.001);
            expect(screenRight).toBeLessThanOrEqual(viewport.width - safeInsets.paddingRight + 0.001);
            expect(screenTop).toBeGreaterThanOrEqual(safeInsets.paddingTop - 0.001);
            expect(screenBottom).toBeLessThanOrEqual(viewport.height - safeInsets.paddingBottom + 0.001);
        });
    });
});
