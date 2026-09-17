import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import PolaroidArtifactBody from "./PolaroidArtifactBody";

// ─── Helpers ────────────────────────────────────────────────────────────────

const FAKE_TOKEN = "test-jwt-token";
const FAKE_BLOB_URL = "blob:http://localhost/fake-object-url";
const FAKE_BLOB = new Blob(["fake image bytes"], { type: "image/jpeg" });

function makeOkResponse(blob = FAKE_BLOB): Response {
    return {
        ok: true,
        blob: () => Promise.resolve(blob),
    } as unknown as Response;
}

function makeErrorResponse(status = 403): Response {
    return {
        ok: false,
        status,
        blob: vi.fn(),
    } as unknown as Response;
}

// ─── Module-level mocks ───────────────────────────────────────────────────

vi.mock("../../lib/storage", () => ({
    getToken: () => FAKE_TOKEN,
}));

// ─── Per-test global mocks ────────────────────────────────────────────────

beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    vi.stubGlobal("URL", {
        createObjectURL: vi.fn().mockReturnValue(FAKE_BLOB_URL),
        revokeObjectURL: vi.fn(),
    });
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
        expect(img).toHaveAttribute("src", FAKE_BLOB_URL);
        expect(URL.createObjectURL).toHaveBeenCalledWith(FAKE_BLOB);
    });

    it("shows a fallback and does not render a broken img on a failed request", async () => {
        vi.mocked(fetch).mockResolvedValue(makeErrorResponse(403));

        render(<PolaroidArtifactBody artifactId={55} />);

        await screen.findByText(/image unavailable/i);

        expect(screen.queryByRole("img")).not.toBeInTheDocument();
    });

    it("revokes the blob URL when the component unmounts", async () => {
        vi.mocked(fetch).mockResolvedValue(makeOkResponse());

        const { unmount } = render(<PolaroidArtifactBody artifactId={55} />);

        await screen.findByRole("img");

        unmount();

        expect(URL.revokeObjectURL).toHaveBeenCalledWith(FAKE_BLOB_URL);
    });

    it("revokes the old blob URL and fetches a new one when artifactId changes", async () => {
        vi.mocked(fetch).mockResolvedValue(makeOkResponse());

        const { rerender } = render(<PolaroidArtifactBody artifactId={55} />);

        await screen.findByRole("img");

        // Simulate navigation to a different artifact
        rerender(<PolaroidArtifactBody artifactId={56} />);

        await waitFor(() => {
            // The old URL should have been revoked
            expect(URL.revokeObjectURL).toHaveBeenCalledWith(FAKE_BLOB_URL);

            // A fresh fetch for the new artifact ID should have been made
            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining("/artifacts/56/image"),
                expect.anything(),
            );
        });
    });
});
