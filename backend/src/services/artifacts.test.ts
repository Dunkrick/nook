import { beforeEach, describe, expect, it, vi } from "vitest";

const { findFirst, create, update, deleteRecord } = vi.hoisted(() => ({
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    deleteRecord: vi.fn(),
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