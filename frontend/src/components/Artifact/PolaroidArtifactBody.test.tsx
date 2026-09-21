import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import PolaroidArtifactBody from "./PolaroidArtifactBody";

const FAKE_IMAGE_URL = "https://storage.googleapis.com/bucket/photo.jpg";

const { get } = vi.hoisted(() => ({
    get: vi.fn(),
}));

vi.mock("../../services/api", () => ({
    get,
}));

afterEach(() => {
    vi.clearAllMocks();
});

describe("PolaroidArtifactBody", () => {
    it("requests the correct Nook API endpoint", async () => {
        get.mockResolvedValue({
            url: FAKE_IMAGE_URL,
        });

        render(<PolaroidArtifactBody artifactId={55} />);

        await waitFor(() => {
            expect(get).toHaveBeenCalledWith(
                "/artifacts/55/image",
            );
        });
    });

    it("renders the image after a successful response", async () => {
        get.mockResolvedValue({
            url: FAKE_IMAGE_URL,
        });

        render(<PolaroidArtifactBody artifactId={55} />);

        const img = await screen.findByRole("img", {
            name: /saved photo/i,
        });

        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute("src", FAKE_IMAGE_URL);
    });

    it("shows a fallback when the image request fails", async () => {
        get.mockRejectedValue(new Error("Forbidden"));

        render(<PolaroidArtifactBody artifactId={55} />);

        await screen.findByText(/image unavailable/i);

        expect(screen.queryByRole("img")).not.toBeInTheDocument();
    });

    it("fetches a new image when artifactId changes", async () => {
        get.mockResolvedValue({
            url: FAKE_IMAGE_URL,
        });

        const { rerender } = render(
            <PolaroidArtifactBody artifactId={55} />,
        );

        await screen.findByRole("img");

        rerender(<PolaroidArtifactBody artifactId={56} />);

        await waitFor(() => {
            expect(get).toHaveBeenLastCalledWith(
                "/artifacts/56/image",
            );
        });
    });
});