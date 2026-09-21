import { beforeEach, describe, expect, it, vi } from "vitest";

const { findFirst, create } = vi.hoisted(() => ({
    findFirst: vi.fn(),
    create: vi.fn(),
}));

vi.mock("../prisma.js", () => ({
    default: {
        workspace: {
            findFirst,
        },
        artifact: {
            create,
        },
    },
}));

import { createArtifact } from "./artifacts.js";

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