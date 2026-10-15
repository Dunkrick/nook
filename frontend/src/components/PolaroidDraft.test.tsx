import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import PolaroidDraft from "./PolaroidDraft";
import { CAPTION_MAX_LENGTH } from "./Artifact/PolaroidArtifactBody";

const { uploadImage } = vi.hoisted(() => ({
    uploadImage: vi.fn(),
}));

vi.mock("../services/uploads", () => ({
    uploadImage,
}));

beforeAll(() => {
    // jsdom has no object URLs.
    URL.createObjectURL = vi.fn(() => "blob:preview");
    URL.revokeObjectURL = vi.fn();
});

afterEach(() => {
    vi.clearAllMocks();
});

function setup() {
    const onCommit = vi.fn().mockResolvedValue(undefined);
    const onCancel = vi.fn();

    const view = render(
        <PolaroidDraft
            position={{ x: 10, y: 20 }}
            onCommit={onCommit}
            onCancel={onCancel}
        />,
    );

    return { onCommit, onCancel, ...view };
}

function chooseFile(container: HTMLElement) {
    const input = container.querySelector(
        'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["x"], "photo.png", { type: "image/png" });

    fireEvent.change(input, { target: { files: [file] } });
}

describe("PolaroidDraft", () => {
    it("starts with the file picker and no caption field", () => {
        const { container } = setup();

        expect(
            container.querySelector('input[type="file"]'),
        ).toBeInTheDocument();
        expect(
            screen.queryByLabelText("Polaroid caption"),
        ).not.toBeInTheDocument();
    });

    it("shows the polaroid frame with a focused caption field once a file is chosen", () => {
        const { container } = setup();

        chooseFile(container);

        const caption = screen.getByLabelText("Polaroid caption");
        expect(caption).toHaveFocus();
        expect(caption).toHaveAttribute(
            "maxlength",
            String(CAPTION_MAX_LENGTH),
        );
    });

    it("keeps the buttons below the frame, not inside it", () => {
        const { container } = setup();

        chooseFile(container);

        expect(
            container.querySelector(".nook-polaroid-draft .nook-polaroid"),
        ).not.toBeNull();
        expect(
            container.querySelector(
                ".nook-polaroid .nook-polaroid-draft__actions",
            ),
        ).toBeNull();
        expect(
            container.querySelector(
                ".nook-polaroid-draft > .nook-polaroid-draft__actions",
            ),
        ).not.toBeNull();
    });

    it("commits the trimmed caption on Enter", async () => {
        uploadImage.mockResolvedValue({ key: "k1" });
        const { container, onCommit } = setup();

        chooseFile(container);
        const caption = screen.getByLabelText("Polaroid caption");
        fireEvent.change(caption, { target: { value: "  Tuesday  " } });
        fireEvent.keyDown(caption, { key: "Enter" });

        await waitFor(() => {
            expect(onCommit).toHaveBeenCalledWith("k1", "Tuesday");
        });
    });

    it("commits without a caption when the strip is left empty", async () => {
        uploadImage.mockResolvedValue({ key: "k2" });
        const { container, onCommit } = setup();

        chooseFile(container);
        fireEvent.click(screen.getByRole("button", { name: "Add photo" }));

        await waitFor(() => {
            expect(onCommit).toHaveBeenCalledWith("k2", undefined);
        });
    });

    it("cancels on Escape without uploading", () => {
        const { container, onCancel } = setup();

        chooseFile(container);
        fireEvent.keyDown(screen.getByLabelText("Polaroid caption"), {
            key: "Escape",
        });

        expect(onCancel).toHaveBeenCalledTimes(1);
        expect(uploadImage).not.toHaveBeenCalled();
    });

    it("shows an error and keeps the draft when the upload fails", async () => {
        vi.spyOn(console, "error").mockImplementation(() => {});
        uploadImage.mockRejectedValue(new Error("network"));
        const { container, onCommit } = setup();

        chooseFile(container);
        fireEvent.click(screen.getByRole("button", { name: "Add photo" }));

        expect(await screen.findByRole("alert")).toHaveTextContent(
            "Couldn't upload that photo.",
        );
        expect(onCommit).not.toHaveBeenCalled();
        expect(screen.getByLabelText("Polaroid caption")).toBeInTheDocument();
    });
});
