import { beforeEach, describe, expect, it, vi } from "vitest";

const { findUnique } = vi.hoisted(() => ({
    findUnique: vi.fn(),
}));

vi.mock("../prisma.js", () => ({
    default: {
        artifact: {
            findUnique,
        },
    },
}));

import { getArtifactImageUrl } from "./artifact-images.js";
import type { ObjectStorage } from "../storage/object-storage.js";

describe("getArtifactImageUrl", () => {
    function createStorage(): ObjectStorage {
        return {
            upload: vi.fn(),
            getSignedReadUrl: vi.fn(),
        };
    }

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns a signed URL for an owned Polaroid", async () => {
        findUnique.mockResolvedValue({
            id: 55,
            userId: 8,
            type: "POLAROID",
            content: {
                imageKey:
                    "uploads/users/8/photo.jpg",
            },
        });

        const storage = createStorage();

        vi.mocked(storage.getSignedReadUrl).mockResolvedValue(
            "https://signed-url.example/photo.jpg",
        );

        const result = await getArtifactImageUrl(
            55,
            8,
            storage,
        );

        expect(result).toBe(
            "https://signed-url.example/photo.jpg",
        );

        expect(findUnique).toHaveBeenCalledWith({
            where: {
                id: 55,
            },
        });

        expect(storage.getSignedReadUrl).toHaveBeenCalledWith(
            "uploads/users/8/photo.jpg",
            900,
        );
    });

    it("throws when the artifact does not exist", async () => {
        findUnique.mockResolvedValue(null);

        const storage = createStorage();

        await expect(
            getArtifactImageUrl(999, 8, storage),
        ).rejects.toMatchObject({
            statusCode: 404,
        });

        expect(
            storage.getSignedReadUrl,
        ).not.toHaveBeenCalled();
    });

    it("rejects access when the artifact belongs to another user", async () => {
        findUnique.mockResolvedValue({
            id: 55,
            userId: 99,
            type: "POLAROID",
            content: {
                imageKey:
                    "uploads/users/99/private.jpg",
            },
        });

        const storage = createStorage();

        await expect(
            getArtifactImageUrl(55, 8, storage),
        ).rejects.toMatchObject({
            statusCode: 403,
        });

        expect(
            storage.getSignedReadUrl,
        ).not.toHaveBeenCalled();
    });

    it("rejects non-Polaroid artifacts", async () => {
        findUnique.mockResolvedValue({
            id: 55,
            userId: 8,
            type: "TEXT",
            content: {
                text: "hello",
            },
        });

        const storage = createStorage();

        await expect(
            getArtifactImageUrl(55, 8, storage),
        ).rejects.toMatchObject({
            statusCode: 400,
        });

        expect(
            storage.getSignedReadUrl,
        ).not.toHaveBeenCalled();
    });

    it("rejects a Polaroid with no imageKey", async () => {
        findUnique.mockResolvedValue({
            id: 55,
            userId: 8,
            type: "POLAROID",
            content: {},
        });

        const storage = createStorage();

        await expect(
            getArtifactImageUrl(55, 8, storage),
        ).rejects.toMatchObject({
            statusCode: 500,
        });

        expect(
            storage.getSignedReadUrl,
        ).not.toHaveBeenCalled();
    });

    it("propagates storage signing failures", async () => {
        findUnique.mockResolvedValue({
            id: 55,
            userId: 8,
            type: "POLAROID",
            content: {
                imageKey:
                    "uploads/users/8/photo.jpg",
            },
        });

        const storage = createStorage();

        vi.mocked(storage.getSignedReadUrl).mockRejectedValue(
            new Error("Signing failed"),
        );

        await expect(
            getArtifactImageUrl(55, 8, storage),
        ).rejects.toThrow("Signing failed");
    });
});