-- DropIndex
DROP INDEX "Player_name_key";

-- CreateTable
CREATE TABLE "PlayerNameChange" (
    "id" TEXT NOT NULL,
    "playerId" INTEGER NOT NULL,
    "oldName" TEXT NOT NULL,
    "when" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerNameChange_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PlayerNameChange" ADD CONSTRAINT "PlayerNameChange_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
