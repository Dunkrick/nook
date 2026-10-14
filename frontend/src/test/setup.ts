import "@testing-library/jest-dom/vitest";

// jsdom runs no CSS and ships no animation constructors, so two browser
// APIs that components read are stubbed here. Without them a component
// that respects prefers-reduced-motion, or that removes a class on
// animationend, cannot be driven in a test.

if (!window.matchMedia) {
    window.matchMedia = ((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
    })) as typeof window.matchMedia;
}

if (typeof window.AnimationEvent === "undefined") {
    class TestAnimationEvent extends Event {
        animationName: string;
        elapsedTime: number;
        pseudoElement: string;

        constructor(
            type: string,
            params: AnimationEventInit = {},
        ) {
            super(type, params);

            this.animationName = params.animationName ?? "";
            this.elapsedTime = params.elapsedTime ?? 0;
            this.pseudoElement = params.pseudoElement ?? "";
        }
    }

    window.AnimationEvent =
        TestAnimationEvent as unknown as typeof AnimationEvent;
}
