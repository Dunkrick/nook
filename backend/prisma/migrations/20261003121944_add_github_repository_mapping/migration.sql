/*
  Warnings:

  - A unique constraint covering the columns `[source,externalId]` on the table `Artifact` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Artifact" ADD COLUMN     "externalId" TEXT,
ADD COLUMN     "source" TEXT;

-- CreateTable
CREATE TABLE "GithubRepository" (
    "id" SERIAL NOT NULL,
    "owner" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "workspaceId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GithubRepository_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GithubRepository_workspaceId_idx" ON "GithubRepository"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "GithubRepository_owner_name_key" ON "GithubRepository"("owner", "name");

-- CreateIndex
CREATE INDEX "Artifact_workspaceId_idx" ON "Artifact"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "Artifact_source_externalId_key" ON "Artifact"("source", "externalId");

-- AddForeignKey
ALTER TABLE "GithubRepository" ADD CONSTRAINT "GithubRepository_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GithubRepository" ADD CONSTRAINT "GithubRepository_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
