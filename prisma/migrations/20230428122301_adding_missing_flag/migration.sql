-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "missing" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "missing" BOOLEAN NOT NULL DEFAULT false;
