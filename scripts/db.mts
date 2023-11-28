import postgres from "postgres";
const { DATABASE_URL } = process.env;

if (!DATABASE_URL) throw Error("Must specify a database URL");

export const sql = postgres(DATABASE_URL, {
  onnotice: () => {},
});

const createPlayerTable = (name: string) => `
  CREATE TABLE IF NOT EXISTS "${name}" (
    "playerid" INTEGER PRIMARY KEY,
    "name" TEXT NOT NULL,
    "clan" INTEGER,
    "description" TEXT
  )
`;

export const CREATE_PLAYER_TABLE = createPlayerTable("Player");

export const CREATE_PLAYER_NEW_TABLE = createPlayerTable("PlayerNew");

export const CREATE_ITEM_TABLE = `
  CREATE TABLE IF NOT EXISTS "Item" (
    "itemid" INTEGER PRIMARY KEY,
    "name" TEXT NOT NULL,
    "picture" TEXT NOT NULL DEFAULT('nopic'),
    "descid" INTEGER,
    "description" TEXT,
    "type" TEXT,
    "itemclass" TEXT,
    "candiscard" BOOLEAN NOT NULL DEFAULT(false),
    "cantransfer" BOOLEAN NOT NULL DEFAULT(false),
    "quest" BOOLEAN NOT NULL DEFAULT(false),
    "gift" BOOLEAN NOT NULL DEFAULT(false),
    "smith" BOOLEAN NOT NULL DEFAULT(false),
    "cook" BOOLEAN NOT NULL DEFAULT(false),
    "cocktail" BOOLEAN NOT NULL DEFAULT(false),
    "jewelry" BOOLEAN NOT NULL DEFAULT(false),
    "hands" INTEGER NOT NULL DEFAULT(1),
    "multiuse" BOOLEAN NOT NULL DEFAULT(false),
    "sellvalue" INTEGER NOT NULL DEFAULT(0),
    "power" INTEGER NOT NULL DEFAULT(0),
    "quest2" BOOLEAN NOT NULL DEFAULT(false),
    "mrstore" BOOLEAN NOT NULL DEFAULT(false),
    "plural" TEXT,
    "ambiguous" BOOLEAN NOT NULL DEFAULT(false),
    "missing" BOOLEAN NOT NULL DEFAULT(false)
  )
`;

const createCollectionTable = (name: string) => `
CREATE TABLE IF NOT EXISTS "${name}" (
  "id" SERIAL PRIMARY KEY,
  "playerid" INTEGER NOT NULL,
  "itemid" INTEGER NOT NULL,
  "quantity" INTEGER NOT NULL,
  "rank" INTEGER NOT NULL DEFAULT 0,
  "lastupdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
)
`;

export const CREATE_COLLECTION_TABLE = createCollectionTable("Collection");
export const CREATE_UNRANKED_COLLECTION_TABLE =
  createCollectionTable("UnrankedCollection");

export const CREATE_DAILY_COLLECTION_TABLE = `
  CREATE TABLE IF NOT EXISTS "DailyCollection" (
    "itemid" INTEGER NOT NULL UNIQUE,
    "name" TEXT NOT NULL,
    "plural" TEXT,
    "players" JSONB NOT NULL
  )
`;

export const CREATE_PLAYER_NAME_CHANGE_TABLE = `
  CREATE TABLE IF NOT EXISTS "PlayerNameChange" (
    "id" SERIAL PRIMARY KEY,
    "playerid" INTEGER NOT NULL REFERENCES "Player"("playerid") DEFERRABLE INITIALLY DEFERRED,
    "oldname" TEXT NOT NULL,
    "when" DATE NOT NULL DEFAULT CURRENT_DATE,
    UNIQUE("playerid", "when")
  )
`;
