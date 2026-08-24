import prisma from "../prisma.js";

export async function getWorkspaces(userId: number) {
    return prisma.workspace.findMany({
        where: {
            ownerId: userId,
        },
        orderBy: {
            createdAt: "asc",
        },
    });
}

export async function getWorkspace(workspaceId: number, userId: number) {
    return prisma.workspace.findFirst({
        where: {
            id: workspaceId,
            ownerId: userId,
        },
    });
}

export async function createWorkspace(
    userId: number,
    name: string
) {
    return prisma.workspace.create({
        data: {
            name,
            ownerId: userId
        }
    });
}

export async function getWorkspaceArtifacts(
    userId: number,
    workspaceId: number
) {
    return prisma.artifact.findMany({
        where: {
            userId,
            workspaceId,
        },
        orderBy: {
            createdAt: "asc",
        },
    });
}