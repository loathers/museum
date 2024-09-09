-- CreateTable
CREATE TABLE "Setting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "Collection" (
    "id" SERIAL NOT NULL,
    "playerid" INTEGER NOT NULL,
    "itemid" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "lastupdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Collection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "itemid" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "picture" TEXT NOT NULL DEFAULT 'nopic',
    "descid" INTEGER,
    "description" TEXT,
    "type" TEXT,
    "itemclass" TEXT,
    "candiscard" BOOLEAN NOT NULL DEFAULT false,
    "cantransfer" BOOLEAN NOT NULL DEFAULT false,
    "quest" BOOLEAN NOT NULL DEFAULT false,
    "gift" BOOLEAN NOT NULL DEFAULT false,
    "smith" BOOLEAN NOT NULL DEFAULT false,
    "cook" BOOLEAN NOT NULL DEFAULT false,
    "cocktail" BOOLEAN NOT NULL DEFAULT false,
    "jewelry" BOOLEAN NOT NULL DEFAULT false,
    "hands" INTEGER NOT NULL DEFAULT 1,
    "multiuse" BOOLEAN NOT NULL DEFAULT false,
    "sellvalue" INTEGER NOT NULL DEFAULT 0,
    "power" INTEGER NOT NULL DEFAULT 0,
    "quest2" BOOLEAN NOT NULL DEFAULT false,
    "mrstore" BOOLEAN NOT NULL DEFAULT false,
    "plural" TEXT,
    "ambiguous" BOOLEAN NOT NULL DEFAULT false,
    "missing" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("itemid")
);

-- CreateTable
CREATE TABLE "Player" (
    "playerid" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "clan" INTEGER,
    "description" TEXT,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("playerid")
);

-- CreateTable
CREATE TABLE "PlayerNameChange" (
    "id" SERIAL NOT NULL,
    "playerid" INTEGER NOT NULL,
    "oldname" TEXT NOT NULL,
    "when" DATE NOT NULL DEFAULT CURRENT_DATE,

    CONSTRAINT "PlayerNameChange_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyCollection" (
    "itemid" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "plural" TEXT,
    "players" JSONB NOT NULL
);

-- CreateTable
CREATE TABLE "UnrankedCollection" (
    "id" SERIAL NOT NULL,
    "playerid" INTEGER NOT NULL,
    "itemid" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "lastupdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UnrankedCollection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerNew" (
    "playerid" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "clan" INTEGER,
    "description" TEXT,

    CONSTRAINT "PlayerNew_pkey" PRIMARY KEY ("playerid")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlayerNameChange_playerid_when_key" ON "PlayerNameChange"("playerid", "when");

-- CreateIndex
CREATE UNIQUE INDEX "DailyCollection_itemid_key" ON "DailyCollection"("itemid");

-- AddForeignKey
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_itemid_fkey" FOREIGN KEY ("itemid") REFERENCES "Item"("itemid") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_playerid_fkey" FOREIGN KEY ("playerid") REFERENCES "Player"("playerid") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "PlayerNameChange" ADD CONSTRAINT "PlayerNameChange_playerid_fkey" FOREIGN KEY ("playerid") REFERENCES "Player"("playerid") ON DELETE NO ACTION ON UPDATE NO ACTION;
