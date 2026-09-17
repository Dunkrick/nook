import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import PolaroidArtifactBody from "./PolaroidArtifactBody";

// ─── Helpers ────────────────────────────────────────────────────────────────

const FAKE_TOKEN = "test-jwt-token";
const FAKE_IMAGE_URL = "https://storage.googleapis.com/bucket/photo.jpg";

function makeOkResponse(url = FAKE_IMAGE_URL): Response {
    return {
        ok: true,
        json: () => Promise.resolve({ url }),
    } as unknown as Response;
}

function makeErrorResponse(status = 403): Response {
    return {
        ok: false,
        status,
        json: vi.fn(),
    } as unknown as Response;
}

// ─── Module-level mocks ───────────────────────────────────────────────────

vi.mock("../../lib/storage", () => ({
    getToken: () => FAKE_TOKEN,
}));

// ─── Per-test global mocks ────────────────────────────────────────────────

beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
});

// ─── Tests ────────────────────────────────────────────────────────────────

describe("PolaroidArtifactBody", () => {
    it("requests the correct Nook API endpoint", async () => {
        vi.mocked(fetch).mockResolvedValue(makeOkResponse());

        render(<PolaroidArtifactBody artifactId={55} />);

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining("/artifacts/55/image"),
                expect.anything(),
            );
        });
    });

    it("sends the Authorization Bearer token", async () => {
        vi.mocked(fetch).mockResolvedValue(makeOkResponse());

        render(<PolaroidArtifactBody artifactId={55} />);

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        Authorization: `Bearer ${FAKE_TOKEN}`,
                    }),
                }),
            );
        });
    });

    it("renders the image after a successful response", async () => {
        vi.mocked(fetch).mockResolvedValue(makeOkResponse());

        render(<PolaroidArtifactBody artifactId={55} />);

        const img = await screen.findByRole("img", { name: /saved photo/i });

        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute("src", FAKE_IMAGE_URL);
    });

    it("shows a fallback and does not render a broken img on a failed request", async () => {
        vi.mocked(fetch).mockResolvedValue(makeErrorResponse(403));

        render(<PolaroidArtifactBody artifactId={55} />);

        await screen.findByText(/image unavailable/i);

        expect(screen.queryByRole("img")).not.toBeInTheDocument();
    });

    it("fetches a new image when artifactId changes", async () => {
        vi.mocked(fetch).mockResolvedValue(makeOkResponse());

        const { rerender } = render(<PolaroidArtifactBody artifactId={55} />);

        await screen.findByRole("img");

        // Simulate navigation to a different artifact
        rerender(<PolaroidArtifactBody artifactId={56} />);

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining("/artifacts/56/image"),
                expect.anything(),
            );
        });
    });
});
