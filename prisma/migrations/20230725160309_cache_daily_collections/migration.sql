-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "quest" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "DailyCollection" (
    "itemId" INTEGER NOT NULL,
    "itemName" TEXT NOT NULL,
    "itemPlural" TEXT,
    "players" JSONB NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyCollection_itemId_key" ON "DailyCollection"("itemId");
