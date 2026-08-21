import prisma from "../src/prisma.js";
import type { User, Workspace } from "@prisma/client";

async function main() {
    console.log("Loading users...");

    const users = await prisma.user.findMany();

    console.log(`Found ${users.length} users`);

    for (const user of users) {
        try {
            await backfillUser(user);
        }
        catch (error) {
            console.error(`Faile for ${user.email}`, error);
        }
    }

    console.log("Workspace backfill complete.");
}

async function backfillUser(user: User) {
    const workspace = await ensureWorkspace(user);

    await migrateArtifacts(user, workspace);
}

async function ensureWorkspace(user: User) {
    let workspace =
        await prisma.workspace.findFirst({
            where: {
                ownerId: user.id,
                name: "Personal",
            },
        });

    if (!workspace) {
        console.log(
            `Creating workspace for ${user.email}`
        );

        workspace =
            await prisma.workspace.create({
                data: {
                    name: "Personal",
                    ownerId: user.id,
                },
            });
    }

    return workspace;
}

async function migrateArtifacts(
    user: User,
    workspace: Workspace
) {
    const result =
        await prisma.artifact.updateMany({
            where: {
                userId: user.id,
                workspaceId: null,
            },
            data: {
                workspaceId: workspace.id,
            },
        });

    console.log(
        `Migrated ${result.count} artifacts for ${user.email}`
    );
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });