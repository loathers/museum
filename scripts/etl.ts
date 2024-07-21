import { pipeline } from "stream/promises";
import { Readable } from "stream";
import fetch from "node-fetch";
import {
  sql,
  CREATE_COLLECTION_TABLE,
  CREATE_DAILY_COLLECTION_TABLE,
  CREATE_ITEM_TABLE,
  CREATE_PLAYER_NAME_CHANGE_TABLE,
  CREATE_PLAYER_TABLE,
  CREATE_PLAYER_NEW_TABLE,
  CREATE_UNRANKED_COLLECTION_TABLE,
} from "./db";

const auth = Buffer.from(
  `${process.env.KOL_HTTP_USERNAME}:${process.env.KOL_HTTP_PASSWORD}`,
).toString("base64");

async function importPlayers() {
  await sql`DROP TABLE IF EXISTS "PlayerNew" CASCADE`;
  await sql.unsafe(CREATE_PLAYER_NEW_TABLE);

  // Ensure the Player table
  await sql.unsafe(CREATE_PLAYER_TABLE);

  const response = await fetch(
    `https://dev.kingdomofloathing.com/collections/player.txt`,
    { headers: { Authorization: `Basic ${auth}` } },
  );

  const text = (await response.text())
    .replace(/\n\\n/g, "\n") // Remove actual newlines from item descriptions
    .replace(/\r/g, "");

  const source = Readable.from(text);
  const sink =
    await sql`COPY "PlayerNew" ("playerid", "name", "clan", "description") FROM STDIN WITH (HEADER MATCH, NULL 'NULL') WHERE "name" is not null`.writable();

  await pipeline(source, sink);

  // Now let's see who's changed their name
  await sql.unsafe(CREATE_PLAYER_NAME_CHANGE_TABLE);

  const nameChanges = await sql`
    INSERT INTO "PlayerNameChange" ("playerid", "oldname")
    SELECT
      "PlayerNew"."playerid", "Player"."name"
      FROM "PlayerNew"
      LEFT JOIN "Player" ON "PlayerNew"."playerid" = "Player"."playerid"
      WHERE lower("PlayerNew"."name") != lower("Player"."name")
    ON CONFLICT DO NOTHING
  `;

  // And rotate out the player db
  await sql.begin((sql) => [
    sql`ALTER TABLE "Player" DISABLE TRIGGER ALL`,
    sql`ALTER TABLE "Collection" DISABLE TRIGGER ALL`,
    sql`DELETE FROM "Player"`,
    sql`INSERT INTO "Player" SELECT * FROM "PlayerNew"`,
    sql`ALTER TABLE "Player" ENABLE TRIGGER ALL`,
    sql`ALTER TABLE "Collection" ENABLE TRIGGER ALL`,
    sql`TRUNCATE "PlayerNew"`,
  ]);

  // In v4 we can get this from the COPY query
  const players = await sql`SELECT COUNT(*) as "count" FROM "Player"`;
  console.timeLog(
    "etl",
    `Imported ${players[0].count} players and noticed ${nameChanges.count} name changes`,
  );
}

async function importItems() {
  await sql`DROP TABLE IF EXISTS "Item" CASCADE`;
  await sql.unsafe(CREATE_ITEM_TABLE);

  const response = await fetch(
    `https://dev.kingdomofloathing.com/collections/items.txt`,
    { headers: { Authorization: `Basic ${auth}` } },
  );

  const text = (await response.text())
    .replace(/\n\\n/g, "\n") // Remove actual newlines from item descriptions
    .replace(/\r/g, "");

  const source = Readable.from(text);
  const sink =
    await sql`COPY "Item" ("itemid", "name", "picture", "descid", "description", "type", "itemclass", "candiscard", "cantransfer", "quest", "gift", "smith", "cook", "cocktail", "jewelry", "hands", "multiuse", "sellvalue", "power", "quest2", "mrstore", "plural") FROM STDIN WITH (HEADER)`.writable();

  await pipeline(source, sink);

  await sql`UPDATE "Item" SET "plural" = NULL WHERE "plural" = ''`;

  // In v4 we can get this from the COPY query
  const collections = await sql`SELECT COUNT(*) as "count" FROM "Item"`;
  console.timeLog("etl", `Imported ${collections[0].count} items`);
}

async function importCollections() {
  await sql`DROP TABLE IF EXISTS "UnrankedCollection" CASCADE`;
  await sql.unsafe(CREATE_UNRANKED_COLLECTION_TABLE);

  const response = await fetch(
    `https://dev.kingdomofloathing.com/collections/collections.txt`,
    { headers: { Authorization: `Basic ${auth}` } },
  );

  if (!response.body) {
    console.error("No body");
    return;
  }

  const source = response.body;
  const sink =
    await sql`COPY "UnrankedCollection" ("playerid", "itemid", "quantity") FROM STDIN WITH (HEADER MATCH) WHERE "playerid" != 6`.writable();

  await pipeline(source, sink);

  // In v4 we can get this from the COPY query
  const collections =
    await sql`SELECT COUNT(*) as "count" FROM "UnrankedCollection"`;
  console.timeLog("etl", `Imported ${collections[0].count} collections`);

  const unknownPlayers = await sql`
    DELETE FROM "UnrankedCollection"
    WHERE NOT EXISTS (
      SELECT NULL FROM "Player"
      WHERE "Player"."playerid" = "UnrankedCollection"."playerid"
    )`;
  console.timeLog(
    "etl",
    `Deleted ${unknownPlayers.count} collections from unknown players`,
  );

  await sql`DROP TABLE IF EXISTS "Collection" CASCADE`;
  await sql.unsafe(CREATE_COLLECTION_TABLE);
  await sql`
    INSERT INTO "Collection"
    SELECT
      "id" ,
      "playerid",
      "itemid",
      "quantity",
      RANK () OVER (PARTITION BY "itemid" ORDER BY "quantity" DESC) "rank",
      "lastupdated"
    FROM "UnrankedCollection";
  `;

  await sql`TRUNCATE "UnrankedCollection"`;

  console.timeLog("etl", "Ranked collections");
}

async function importData() {
  await importItems();
  await importPlayers();
  await importCollections();
}

async function normaliseData() {
  // Mark ambiguously named items
  const ambiguous = await sql`
    UPDATE "Item" SET "ambiguous" = true
    FROM (
      SELECT "name", COUNT(*) as "count" FROM "Item"
      GROUP BY "name"
    ) as "s"
    WHERE "s"."count" > 1 AND "s"."name" = "Item"."name"`;
  console.timeLog(
    "etl",
    `Marked ${ambiguous.count} items as ambiguously named`,
  );

  // Add filler items
  const unknownItems = await sql`
    INSERT INTO "Item"
      ("itemid", "name", "description", "missing")
    SELECT
      DISTINCT "itemid",
      'Unknown',
      'Museum heard that this item exists but doesn''t know anything about it!',
      true
    FROM "Collection"
    WHERE NOT EXISTS (
      SELECT NULL FROM "Item"
      WHERE "Item"."itemid" = "Collection"."itemid"
    )`;
  console.timeLog(
    "etl",
    `Created ${unknownItems.count} filler items because they appear in collections`,
  );

  // Add foreign key relations
  await sql`
    ALTER TABLE "Collection"
      ADD FOREIGN KEY ("itemid") REFERENCES "Item"("itemid") DEFERRABLE INITIALLY DEFERRED,
      ADD FOREIGN KEY ("playerid") REFERENCES "Player"("playerid") DEFERRABLE INITIALLY DEFERRED
  `;
}

async function pickDailyRandomCollections() {
  await sql`DROP TABLE IF EXISTS "DailyCollection" CASCADE`;
  await sql.unsafe(CREATE_DAILY_COLLECTION_TABLE);

  // Pick the items to include
  await sql`
    INSERT INTO "DailyCollection"
      ("itemid", "name", "plural", "players")
    SELECT
      "Collection"."itemid",
      "name",
      "plural",
      '[]'::json as "players"
    FROM (
      SELECT "itemid"
      FROM "Collection"
      WHERE "rank" = 1 AND "quantity" > 1
      GROUP BY "itemid"
      ORDER BY RANDOM()
      LIMIT 10
    ) AS "Collection"
    LEFT JOIN "Item" ON "Collection"."itemid" = "Item"."itemid"
  `;

  // Then fill them with players
  await sql`
    UPDATE "DailyCollection" SET "players" = (
      SELECT json_agg(json_build_object('playerid', "Player"."playerid", 'name', "Player"."name"))
      FROM "Collection"
      LEFT JOIN "Player" ON "Player"."playerid" = "Collection"."playerid"
      WHERE 
        "Collection"."rank" = 1 AND
        "Collection"."itemid" = "DailyCollection"."itemid"
    )
  `;

  console.timeLog("etl", "Picked daily collections");
}

export async function handler() {
  console.time("etl");
  await importData();
  await normaliseData();
  await pickDailyRandomCollections();
  console.timeEnd("etl");
}

await handler();
process.exit();
