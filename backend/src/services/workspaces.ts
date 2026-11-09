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

export async function updateWorkspace(
    workspaceId: number,
    userId: number,
    name: string
) {
    const existing = await prisma.workspace.findFirst({
        where: {
            id: workspaceId,
            ownerId: userId,
        },
    });

    if (!existing) {
        return null;
    }

    return prisma.workspace.update({
        where: {
            id: workspaceId,
        },
        data: {
            name,
        },
    });
}

export async function getWorkspaceArtifacts(
    workspaceId: number,
    userId: number
) {
    const workspace = await prisma.workspace.findFirst({
        where: {
            id: workspaceId,
            ownerId: userId,
        },
    });

    if (!workspace) {
        return null;
    }

    return prisma.artifact.findMany({
        where: {
            userId,
            workspaceId
        },
        orderBy: {
            createdAt: "asc",
        },
    });
}