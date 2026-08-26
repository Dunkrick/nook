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
            workspaceId,
        },
        orderBy: {
            createdAt: "asc",
        },
    });
}