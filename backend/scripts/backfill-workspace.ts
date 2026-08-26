import prisma from "../src/prisma.js";
import type { Prisma, User, Workspace } from "../src/generated/prisma/client.js";

type TransactionClient = Prisma.TransactionClient;

async function main() {
    console.log("Loading users...");

    const users = await prisma.user.findMany();

    console.log(`Found ${users.length} users`);

    for (const user of users) {
        try {
            await backfillUser(user);
        }
        catch (error) {
            console.error(`Failed for ${user.email}`, error);
            throw error;
        }
    }

    console.log("Workspace backfill complete.");
}

async function backfillUser(user: User) {
    await prisma.$transaction(async (tx) => {
        const workspace =
            await ensureWorkspace(tx, user);

        await migrateArtifacts(
            tx,
            user,
            workspace
        );
    });
}

async function ensureWorkspace(tx: TransactionClient, user: User) {
    let workspace =
        await tx.workspace.findFirst({
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
            await tx.workspace.create({
                data: {
                    name: "Personal",
                    ownerId: user.id,
                },
            });
    }

    return workspace;
}

async function migrateArtifacts(
    tx: TransactionClient,
    user: User,
    workspace: Workspace
) {
    const result =
        await tx.artifact.updateMany({
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
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });