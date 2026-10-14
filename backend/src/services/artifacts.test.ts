import { beforeEach, describe, expect, it, vi } from "vitest";

const { findFirst, create, update, deleteRecord, findArtifact } = vi.hoisted(() => ({
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    deleteRecord: vi.fn(),
    findArtifact: vi.fn(),
}));

vi.mock("../prisma.js", () => ({
    default: {
        workspace: {
            findFirst,
        },
        artifact: {
            create,
            update,
            delete: deleteRecord,
            findFirst: findArtifact,
        },
    },
}));

import {
    createArtifact,
    updateArtifact,
    deleteArtifact,
} from "./artifacts.js";

describe("createArtifact", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("rejects a Polaroid image that belongs to another user", async () => {
        findFirst.mockResolvedValue({
            id: 10,
            ownerId: 8,
        });

        await expect(
            createArtifact({
                type: "POLAROID",
                imageKey: "uploads/users/99/private.jpg",
                userId: 8,
                workspaceId: 10,
                x: 0,
                y: 0,
            }),
        ).rejects.toMatchObject({
            statusCode: 403,
        });

        expect(create).not.toHaveBeenCalled();
    });

    it("accepts a Polaroid image that belongs to the user", async () => {
        findFirst.mockResolvedValue({
            id: 10,
            ownerId: 8,
        });

        create.mockResolvedValue({
            id: 55,
            userId: 8,
            workspaceId: 10,
            type: "POLAROID",
            content: {
                imageKey: "uploads/users/8/photo.jpg",
            },
            x: 0,
            y: 0,
            zIndex: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        const result = await createArtifact({
            type: "POLAROID",
            imageKey: "uploads/users/8/photo.jpg",
            userId: 8,
            workspaceId: 10,
            x: 0,
            y: 0,
        });

        expect(result.workspaceId).toBe(10);

        expect(create).toHaveBeenCalled();
    });

    it("stores a caption with the image key", async () => {
        findFirst.mockResolvedValue({
            id: 10,
            ownerId: 8,
        });

        create.mockResolvedValue({
            id: 55,
            userId: 8,
            workspaceId: 10,
            type: "POLAROID",
            content: {
                imageKey: "uploads/users/8/photo.jpg",
                caption: "First roll",
            },
            x: 0,
            y: 0,
            zIndex: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        const result = await createArtifact({
            type: "POLAROID",
            imageKey: "uploads/users/8/photo.jpg",
            caption: "First roll",
            userId: 8,
            workspaceId: 10,
            x: 0,
            y: 0,
        });

        expect(result.content).toEqual({
            imageKey: "uploads/users/8/photo.jpg",
            caption: "First roll",
        });

        expect(create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    content: {
                        imageKey: "uploads/users/8/photo.jpg",
                        caption: "First roll",
                    },
                }),
            }),
        );
    });

    it("leaves out the caption key when the caption is empty", async () => {
        findFirst.mockResolvedValue({
            id: 10,
            ownerId: 8,
        });

        create.mockResolvedValue({
            id: 55,
            userId: 8,
            workspaceId: 10,
            type: "POLAROID",
            content: {
                imageKey: "uploads/users/8/photo.jpg",
            },
            x: 0,
            y: 0,
            zIndex: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        await createArtifact({
            type: "POLAROID",
            imageKey: "uploads/users/8/photo.jpg",
            caption: "",
            userId: 8,
            workspaceId: 10,
            x: 0,
            y: 0,
        });

        expect(create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    content: {
                        imageKey: "uploads/users/8/photo.jpg",
                    },
                }),
            }),
        );
    });
});

describe("updateArtifact", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("updates an artifact for the owning user and workspace", async () => {
        update.mockResolvedValue({
            id: 55,
            userId: 8,
            workspaceId: 10,
            type: "TEXT",
            content: {
                text: "updated",
            },
            x: 20,
            y: 30,
            zIndex: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        const result = await updateArtifact({
            id: 55,
            userId: 8,
            workspaceId: 10,
            text: "updated",
            x: 20,
            y: 30,
        });

        expect(result).not.toBeNull();
        expect(result!.id).toBe(55);

        expect(update).toHaveBeenCalledWith({
            where: {
                id: 55,
                userId: 8,
                workspaceId: 10,
            },
            data: {
                content: {
                    text: "updated",
                },
                x: 20,
                y: 30,
            },
        });
    });

    it("writes a caption and keeps the image key", async () => {
        findArtifact.mockResolvedValue({
            id: 55,
            userId: 8,
            workspaceId: 10,
            type: "POLAROID",
            content: {
                imageKey: "uploads/users/8/photo.jpg",
            },
        });

        update.mockResolvedValue({
            id: 55,
            userId: 8,
            workspaceId: 10,
            type: "POLAROID",
            content: {
                imageKey: "uploads/users/8/photo.jpg",
                caption: "Beach day",
            },
            x: 0,
            y: 0,
            zIndex: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        const result = await updateArtifact({
            id: 55,
            userId: 8,
            workspaceId: 10,
            caption: "Beach day",
        });

        expect(result?.content).toEqual({
            imageKey: "uploads/users/8/photo.jpg",
            caption: "Beach day",
        });

        expect(update).toHaveBeenCalledWith({
            where: {
                id: 55,
                userId: 8,
                workspaceId: 10,
            },
            data: {
                content: {
                    imageKey: "uploads/users/8/photo.jpg",
                    caption: "Beach day",
                },
            },
        });
    });

    it("replaces an existing caption and keeps other content keys", async () => {
        findArtifact.mockResolvedValue({
            id: 55,
            userId: 8,
            workspaceId: 10,
            type: "POLAROID",
            content: {
                imageKey: "uploads/users/8/photo.jpg",
                caption: "Old",
                takenAt: "2026-01-01",
            },
        });

        update.mockResolvedValue({
            id: 55,
            userId: 8,
            workspaceId: 10,
            type: "POLAROID",
            content: {
                imageKey: "uploads/users/8/photo.jpg",
                caption: "New",
                takenAt: "2026-01-01",
            },
            x: 0,
            y: 0,
            zIndex: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        await updateArtifact({
            id: 55,
            userId: 8,
            workspaceId: 10,
            caption: "New",
        });

        expect(update).toHaveBeenCalledWith({
            where: {
                id: 55,
                userId: 8,
                workspaceId: 10,
            },
            data: {
                content: {
                    imageKey: "uploads/users/8/photo.jpg",
                    caption: "New",
                    takenAt: "2026-01-01",
                },
            },
        });
    });

    it("clears the caption when it is empty", async () => {
        findArtifact.mockResolvedValue({
            id: 55,
            userId: 8,
            workspaceId: 10,
            type: "POLAROID",
            content: {
                imageKey: "uploads/users/8/photo.jpg",
                caption: "Old",
            },
        });

        update.mockResolvedValue({
            id: 55,
            userId: 8,
            workspaceId: 10,
            type: "POLAROID",
            content: {
                imageKey: "uploads/users/8/photo.jpg",
            },
            x: 0,
            y: 0,
            zIndex: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        const result = await updateArtifact({
            id: 55,
            userId: 8,
            workspaceId: 10,
            caption: "",
        });

        expect(result?.content).toEqual({
            imageKey: "uploads/users/8/photo.jpg",
        });

        expect(update).toHaveBeenCalledWith({
            where: {
                id: 55,
                userId: 8,
                workspaceId: 10,
            },
            data: {
                content: {
                    imageKey: "uploads/users/8/photo.jpg",
                },
            },
        });
    });

    it("rejects a caption on a text artifact", async () => {
        findArtifact.mockResolvedValue({
            id: 55,
            userId: 8,
            workspaceId: 10,
            type: "TEXT",
            content: {
                text: "a thought",
            },
        });

        await expect(
            updateArtifact({
                id: 55,
                userId: 8,
                workspaceId: 10,
                caption: "Beach day",
            }),
        ).rejects.toMatchObject({
            statusCode: 400,
        });

        expect(update).not.toHaveBeenCalled();
    });

    it("keeps the image key when the caption moves the photo", async () => {
        findArtifact.mockResolvedValue({
            id: 55,
            userId: 8,
            workspaceId: 10,
            type: "POLAROID",
            content: {
                imageKey: "uploads/users/8/photo.jpg",
                caption: "Old",
            },
        });

        update.mockResolvedValue({
            id: 55,
            userId: 8,
            workspaceId: 10,
            type: "POLAROID",
            content: {
                imageKey: "uploads/users/8/photo.jpg",
                caption: "New",
            },
            x: 30,
            y: 40,
            zIndex: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        await updateArtifact({
            id: 55,
            userId: 8,
            workspaceId: 10,
            caption: "New",
            x: 30,
            y: 40,
        });

        expect(update).toHaveBeenCalledWith({
            where: {
                id: 55,
                userId: 8,
                workspaceId: 10,
            },
            data: {
                content: {
                    imageKey: "uploads/users/8/photo.jpg",
                    caption: "New",
                },
                x: 30,
                y: 40,
            },
        });
    });

    it("reads the artifact inside the owner and workspace scope", async () => {
        findArtifact.mockResolvedValue({
            id: 55,
            userId: 8,
            workspaceId: 10,
            type: "POLAROID",
            content: {
                imageKey: "uploads/users/8/photo.jpg",
            },
        });

        update.mockResolvedValue({
            id: 55,
            userId: 8,
            workspaceId: 10,
            type: "POLAROID",
            content: {
                imageKey: "uploads/users/8/photo.jpg",
                caption: "Beach day",
            },
            x: 0,
            y: 0,
            zIndex: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        await updateArtifact({
            id: 55,
            userId: 8,
            workspaceId: 10,
            caption: "Beach day",
        });

        expect(findArtifact).toHaveBeenCalledWith({
            where: {
                id: 55,
                userId: 8,
                workspaceId: 10,
            },
        });
    });

    it("returns null when the artifact is not found for the user", async () => {
        findArtifact.mockResolvedValue(null);

        const result = await updateArtifact({
            id: 55,
            userId: 9,
            workspaceId: 10,
            caption: "Beach day",
        });

        expect(result).toBeNull();
        expect(update).not.toHaveBeenCalled();
    });

    it("does not read the artifact for a text update", async () => {
        update.mockResolvedValue({
            id: 55,
            userId: 8,
            workspaceId: 10,
            type: "TEXT",
            content: {
                text: "updated",
            },
            x: 0,
            y: 0,
            zIndex: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        await updateArtifact({
            id: 55,
            userId: 8,
            workspaceId: 10,
            text: "updated",
        });

        expect(findArtifact).not.toHaveBeenCalled();
    });
});

describe("deleteArtifact", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("deletes an artifact for the owning user and workspace", async () => {
        deleteRecord.mockResolvedValue({
            id: 55,
        });

        const result = await deleteArtifact(55, 8, 10);

        expect(result).toEqual({
            id: 55,
        });

        expect(deleteRecord).toHaveBeenCalledWith({
            where: {
                id: 55,
                userId: 8,
                workspaceId: 10,
            },
        });
    });
});