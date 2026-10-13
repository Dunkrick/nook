-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "ArtifactType" AS ENUM ('TEXT', 'LINK', 'POLAROID', 'GITHUB_ISSUE');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Friend',
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workspace" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ownerId" INTEGER NOT NULL,

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Artifact" (
    "id" SERIAL NOT NULL,
    "type" "ArtifactType" NOT NULL,
    "content" JSONB NOT NULL,
    "x" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "y" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "zIndex" INTEGER NOT NULL DEFAULT 0,
    "userId" INTEGER NOT NULL,
    "workspaceId" INTEGER NOT NULL,
    "source" TEXT,
    "externalId" TEXT,

    CONSTRAINT "Artifact_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "WebhookDelivery" (
    "id" SERIAL NOT NULL,
    "deliveryId" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'RECEIVED',
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "WebhookDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_slug_key" ON "Workspace"("slug");

-- CreateIndex
CREATE INDEX "Artifact_workspaceId_idx" ON "Artifact"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "Artifact_source_externalId_key" ON "Artifact"("source", "externalId");

-- CreateIndex
CREATE INDEX "GithubRepository_workspaceId_idx" ON "GithubRepository"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "GithubRepository_owner_name_key" ON "GithubRepository"("owner", "name");

-- CreateIndex
CREATE UNIQUE INDEX "WebhookDelivery_deliveryId_key" ON "WebhookDelivery"("deliveryId");

-- AddForeignKey
ALTER TABLE "Workspace" ADD CONSTRAINT "Workspace_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Artifact" ADD CONSTRAINT "Artifact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Artifact" ADD CONSTRAINT "Artifact_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GithubRepository" ADD CONSTRAINT "GithubRepository_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GithubRepository" ADD CONSTRAINT "GithubRepository_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

