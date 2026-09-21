/*
  Warnings:

  - Made the column `workspaceId` on table `Artifact` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Artifact" ALTER COLUMN "workspaceId" SET NOT NULL;
