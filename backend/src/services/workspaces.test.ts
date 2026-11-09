import { beforeEach, describe, expect, it, vi } from "vitest";

const { findFirst, update } = vi.hoisted(() => ({
    findFirst: vi.fn(),
    update: vi.fn(),
}));

vi.mock("../prisma.js", () => ({
    default: {
        workspace: {
            findFirst,
            update,
        },
    },
}));

import { updateWorkspace } from "./workspaces.js";

describe("updateWorkspace", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("updates the workspace name when owned by the user", async () => {
        findFirst.mockResolvedValue({
            id: 10,
            ownerId: 5,
            name: "Old Name",
        });

        update.mockResolvedValue({
            id: 10,
            ownerId: 5,
            name: "New Name",
        });

        const result = await updateWorkspace(10, 5, "New Name");

        expect(findFirst).toHaveBeenCalledWith({
            where: {
                id: 10,
                ownerId: 5,
            },
        });
        expect(update).toHaveBeenCalledWith({
            where: {
                id: 10,
            },
            data: {
                name: "New Name",
            },
        });
        expect(result).toEqual({
            id: 10,
            ownerId: 5,
            name: "New Name",
        });
    });

    it("returns null if the workspace is not owned by the user", async () => {
        findFirst.mockResolvedValue(null);

        const result = await updateWorkspace(10, 999, "Renamed Space");

        expect(findFirst).toHaveBeenCalledWith({
            where: {
                id: 10,
                ownerId: 999,
            },
        });
        expect(update).not.toHaveBeenCalled();
        expect(result).toBeNull();
    });

    it("returns null if the workspace does not exist", async () => {
        findFirst.mockResolvedValue(null);

        const result = await updateWorkspace(9999, 5, "Renamed Space");

        expect(update).not.toHaveBeenCalled();
        expect(result).toBeNull();
    });
});
