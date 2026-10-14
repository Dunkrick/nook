import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import PolaroidArtifactBody, {
    CAPTION_MAX_LENGTH,
} from "./PolaroidArtifactBody";
import { markPhotoAsNew } from "../../lib/developingPhotos";

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

function mockImageUrl() {
    get.mockResolvedValue({
        url: FAKE_IMAGE_URL,
    });
}

async function renderPolaroid(
    props: Partial<React.ComponentProps<typeof PolaroidArtifactBody>> = {},
) {
    mockImageUrl();

    render(
        <PolaroidArtifactBody
            artifactId={55}
            onSaveCaption={() => {}}
            {...props}
        />,
    );

    // Wait for the photo to arrive, so no state lands after the test.
    await screen.findByRole("img");
}

function openCaptionEditor() {
    fireEvent.doubleClick(
        screen.getByRole("button", { name: /polaroid caption/i }),
    );

    return screen.getByLabelText("Polaroid caption");
}

describe("PolaroidArtifactBody", () => {
    it("requests the correct Nook API endpoint", async () => {
        mockImageUrl();

        render(
            <PolaroidArtifactBody
                artifactId={55}
                onSaveCaption={() => {}}
            />,
        );

        await waitFor(() => {
            expect(get).toHaveBeenCalledWith(
                "/artifacts/55/image",
            );
        });
    });

    it("renders the image after a successful response", async () => {
        mockImageUrl();

        render(
            <PolaroidArtifactBody
                artifactId={55}
                onSaveCaption={() => {}}
            />,
        );

        const img = await screen.findByRole("img", {
            name: /saved photo/i,
        });

        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute("src", FAKE_IMAGE_URL);
    });

    it("uses the caption as the image alt text", async () => {
        mockImageUrl();

        render(
            <PolaroidArtifactBody
                artifactId={55}
                caption="Beach day"
                onSaveCaption={() => {}}
            />,
        );

        const img = await screen.findByRole("img", {
            name: /beach day/i,
        });

        expect(img).toBeInTheDocument();
    });

    it("shows the photo error when the image request fails", async () => {
        get.mockRejectedValue(new Error("Forbidden"));

        render(
            <PolaroidArtifactBody
                artifactId={55}
                onSaveCaption={() => {}}
            />,
        );

        await screen.findByText(
            /photo didn't load\. reload the wall, or upload it again\./i,
        );

        expect(screen.queryByRole("img")).not.toBeInTheDocument();
    });

    it("fetches a new image when artifactId changes", async () => {
        mockImageUrl();

        const { rerender } = render(
            <PolaroidArtifactBody
                artifactId={55}
                onSaveCaption={() => {}}
            />,
        );

        await screen.findByRole("img");

        rerender(
            <PolaroidArtifactBody
                artifactId={56}
                onSaveCaption={() => {}}
            />,
        );

        await waitFor(() => {
            expect(get).toHaveBeenLastCalledWith(
                "/artifacts/56/image",
            );
        });
    });
});

describe("PolaroidArtifactBody caption strip", () => {
    it("shows the saved caption", async () => {
        await renderPolaroid({ caption: "First roll" });

        expect(
            screen.getByRole("button", { name: /polaroid caption/i }),
        ).toHaveTextContent("First roll");
    });

    it("keeps the strip empty without a caption", async () => {
        await renderPolaroid();

        expect(
            screen.getByRole("button", { name: /polaroid caption/i }),
        ).toBeEmptyDOMElement();
    });

    it("shows the placeholder only while selected", async () => {
        await renderPolaroid();

        expect(
            screen.getByRole("button", { name: /polaroid caption/i }),
        ).toBeEmptyDOMElement();

        await renderPolaroid({ isSelected: true });

        expect(
            screen.getAllByRole("button", { name: /polaroid caption/i })[1],
        ).toHaveTextContent("Write something");
    });

    it("saves the caption on Enter", async () => {
        const onSaveCaption = vi.fn();

        await renderPolaroid({ onSaveCaption });

        const input = openCaptionEditor();

        fireEvent.change(input, { target: { value: "Beach day" } });
        fireEvent.keyDown(input, { key: "Enter" });

        expect(onSaveCaption).toHaveBeenCalledWith("Beach day");
        expect(
            screen.queryByRole("textbox"),
        ).not.toBeInTheDocument();
    });

    it("does not save on Escape", async () => {
        const onSaveCaption = vi.fn();

        await renderPolaroid({ caption: "Old note", onSaveCaption });

        const input = openCaptionEditor();

        fireEvent.change(input, { target: { value: "Wrong note" } });
        fireEvent.keyDown(input, { key: "Escape" });

        expect(onSaveCaption).not.toHaveBeenCalled();
        expect(
            screen.getByRole("button", { name: /polaroid caption/i }),
        ).toHaveTextContent("Old note");
    });

    it("saves on blur", async () => {
        const onSaveCaption = vi.fn();

        await renderPolaroid({ onSaveCaption });

        const input = openCaptionEditor();

        fireEvent.change(input, { target: { value: "Sunset" } });
        fireEvent.blur(input);

        expect(onSaveCaption).toHaveBeenCalledWith("Sunset");
    });

    it("opens the editor from the keyboard", async () => {
        await renderPolaroid();

        const strip = screen.getByRole("button", {
            name: /polaroid caption/i,
        });

        strip.focus();

        expect(strip).toHaveFocus();

        fireEvent.keyDown(strip, { key: "Enter" });

        expect(
            screen.getByLabelText("Polaroid caption"),
        ).toHaveFocus();
    });

    it("opens the editor from the keyboard with the space bar", async () => {
        await renderPolaroid();

        const strip = screen.getByRole("button", {
            name: /polaroid caption/i,
        });

        strip.focus();
        fireEvent.keyDown(strip, { key: " " });

        expect(
            screen.getByLabelText("Polaroid caption"),
        ).toBeInTheDocument();
    });

    it("caps the caption input at the film strip limit", async () => {
        const onSaveCaption = vi.fn();

        await renderPolaroid({ onSaveCaption });

        const input = openCaptionEditor();

        expect(input).toHaveAttribute(
            "maxLength",
            String(CAPTION_MAX_LENGTH),
        );

        fireEvent.change(input, {
            target: { value: "a".repeat(CAPTION_MAX_LENGTH) },
        });
        fireEvent.keyDown(input, { key: "Enter" });

        expect(onSaveCaption).toHaveBeenCalledWith(
            "a".repeat(CAPTION_MAX_LENGTH),
        );
    });

    it("trims the caption before it is saved", async () => {
        const onSaveCaption = vi.fn();

        await renderPolaroid({ onSaveCaption });

        const input = openCaptionEditor();

        fireEvent.change(input, { target: { value: "  Beach day  " } });
        fireEvent.keyDown(input, { key: "Enter" });

        expect(onSaveCaption).toHaveBeenCalledWith("Beach day");
    });

    it("sends an empty caption to clear it", async () => {
        const onSaveCaption = vi.fn();

        await renderPolaroid({ caption: "Old note", onSaveCaption });

        const input = openCaptionEditor();

        fireEvent.change(input, { target: { value: "" } });
        fireEvent.keyDown(input, { key: "Enter" });

        expect(onSaveCaption).toHaveBeenCalledWith("");
    });

    it("does not send an unchanged caption", async () => {
        const onSaveCaption = vi.fn();

        await renderPolaroid({ caption: "Old note", onSaveCaption });

        const input = openCaptionEditor();

        fireEvent.keyDown(input, { key: "Enter" });

        expect(onSaveCaption).not.toHaveBeenCalled();
    });
});

describe("PolaroidArtifactBody develop", () => {
    it("develops a photo marked as new in this session", async () => {
        mockImageUrl();
        markPhotoAsNew(77);

        render(
            <PolaroidArtifactBody
                artifactId={77}
                onSaveCaption={() => {}}
            />,
        );

        await waitFor(() => {
            expect(
                document.querySelector(".nook-polaroid--developing"),
            ).toBeInTheDocument();
        });
    });

    it("does not develop a photo loaded from the wall", async () => {
        mockImageUrl();

        render(
            <PolaroidArtifactBody
                artifactId={78}
                onSaveCaption={() => {}}
            />,
        );

        await screen.findByRole("img");

        expect(
            document.querySelector(".nook-polaroid--developing"),
        ).not.toBeInTheDocument();
    });

    it("stops developing when the animation ends", async () => {
        mockImageUrl();
        markPhotoAsNew(79);

        render(
            <PolaroidArtifactBody
                artifactId={79}
                onSaveCaption={() => {}}
            />,
        );

        const developing = await waitFor(() => {
            const element = document.querySelector(
                ".nook-polaroid--developing",
            );

            expect(element).not.toBeNull();

            return element as HTMLElement;
        });

        // The animation runs on the image area, not the frame.
        const image = developing.querySelector(
            ".nook-polaroid__image",
        ) as HTMLElement;

        fireEvent(
            image,
            new Event("animationend", { bubbles: true }),
        );

        await waitFor(() => {
            expect(
                document.querySelector(".nook-polaroid--developing"),
            ).not.toBeInTheDocument();
        });
    });

    it("develops one photo only once", async () => {
        mockImageUrl();
        markPhotoAsNew(80);

        const first = render(
            <PolaroidArtifactBody
                artifactId={80}
                onSaveCaption={() => {}}
            />,
        );

        await screen.findByRole("img");
        first.unmount();

        render(
            <PolaroidArtifactBody
                artifactId={80}
                onSaveCaption={() => {}}
            />,
        );

        await screen.findByRole("img");

        expect(
            document.querySelector(".nook-polaroid--developing"),
        ).not.toBeInTheDocument();
    });
});
