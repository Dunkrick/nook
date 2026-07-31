-- Rename existing table while preserving its rows
ALTER TABLE "Dream" RENAME TO "Card";

-- Keep constraint names aligned with the renamed domain model
ALTER TABLE "Card"
RENAME CONSTRAINT "Dream_pkey" TO "Card_pkey";

ALTER TABLE "Card"
RENAME CONSTRAINT "Dream_userId_fkey" TO "Card_userId_fkey";

-- Add spatial coordinates
ALTER TABLE "Card"
ADD COLUMN "x" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN "y" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- Existing rows receive the migration timestamp;
-- Prisma maintains this value on subsequent updates
ALTER TABLE "Card"
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;