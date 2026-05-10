import { Readable } from "stream";
import { pipeline } from "stream/promises";
import copyFrom from "pg-copy-streams";

import { db } from "../db.server";
import {
  createCollectionTable,
  createDailyCollectionTable,
  createItemSeenTable,
  createItemTable,
  createPlayerNameChangeTable,
  createPlayerTable,
} from "../schema";

import { pool, query } from "./db";

const auth = Buffer.from(
  `${process.env.KOL_HTTP_USERNAME}:${process.env.KOL_HTTP_PASSWORD}`,
).toString("base64");

async function importPlayers() {
  await db.schema.dropTable("PlayerNew").ifExists().cascade().execute();
  await createPlayerTable(db, "PlayerNew").execute();

  // Ensure the Player table
  await createPlayerTable(db, "Player").execute();

  const response = await fetch(
    `https://dev.kingdomofloathing.com/collections/player.txt`,
    { headers: { Authorization: `Basic ${auth}` } },
  );

  const text = (await response.text())
    .replace(/\n\\n/g, "\n") // Remove actual newlines from item descriptions
    .replace(/\r/g, "");

  const client = await pool.connect();
  try {
    const copyStream = client.query(
      copyFrom.from(
        `COPY "PlayerNew" ("playerid", "name", "clan", "description") FROM STDIN WITH (HEADER MATCH, NULL 'NULL')`,
      ),
    );
    const source = Readable.from(text);
    await pipeline(source, copyStream);
  } finally {
    client.release();
  }

  // Delete rows where name is null (can't filter in COPY with pg-copy-streams)
  await query(`DELETE FROM "PlayerNew" WHERE "name" IS NULL`);

  // Now let's see who's changed their name
  await createPlayerNameChangeTable(db).execute();

  const nameChanges = await query(`
    INSERT INTO "PlayerNameChange" ("playerid", "oldname")
    SELECT
      "PlayerNew"."playerid", "Player"."name"
      FROM "PlayerNew"
      LEFT JOIN "Player" ON "PlayerNew"."playerid" = "Player"."playerid"
      WHERE lower("PlayerNew"."name") != lower("Player"."name")
    ON CONFLICT DO NOTHING
  `);

  // And rotate out the player db
  await query(`ALTER TABLE "Player" DISABLE TRIGGER ALL`);
  await query(`ALTER TABLE "Collection" DISABLE TRIGGER ALL`);
  await db.deleteFrom("Player").execute();
  await query(`INSERT INTO "Player" SELECT * FROM "PlayerNew"`);
  await query(`ALTER TABLE "Player" ENABLE TRIGGER ALL`);
  await query(`ALTER TABLE "Collection" ENABLE TRIGGER ALL`);
  await query(`TRUNCATE "PlayerNew"`);

  // In v4 we can get this from the COPY query
  const players = await db
    .selectFrom("Player")
    .select((eb) => eb.fn.countAll().as("count"))
    .executeTakeFirstOrThrow();
  console.timeLog(
    "etl",
    `Imported ${players.count} players and noticed ${nameChanges.rowCount} name changes`,
  );
}

async function importItems() {
  // Disable referential integrity checks
  await query(`ALTER TABLE IF EXISTS "ItemSeen" DISABLE TRIGGER ALL`);

  // Recreate the Item table
  await db.schema.dropTable("Item").ifExists().cascade().execute();
  await createItemTable(db).execute();

  const response = await fetch(
    `https://dev.kingdomofloathing.com/collections/items.txt`,
    { headers: { Authorization: `Basic ${auth}` } },
  );

  const text = (await response.text())
    .replace(/\n\\n/g, "\n") // Remove actual newlines from item descriptions
    .replace(/\r/g, "");

  const client = await pool.connect();
  try {
    const copyStream = client.query(
      copyFrom.from(
        `COPY "Item" ("itemid", "name", "picture", "descid", "description", "type", "itemclass", "candiscard", "cantransfer", "quest", "gift", "smith", "cook", "cocktail", "jewelry", "hands", "multiuse", "sellvalue", "power", "quest2", "mrstore", "plural") FROM STDIN WITH (HEADER)`,
      ),
    );
    const source = Readable.from(text);
    await pipeline(source, copyStream);
  } finally {
    client.release();
  }

  // Normalise plurals
  await db
    .updateTable("Item")
    .set({ plural: null })
    .where("plural", "=", "")
    .execute();

  // Re-enable referential integrity checks
  await query(`ALTER TABLE IF EXISTS "ItemSeen" ENABLE TRIGGER ALL`);

  // In v4 we can get this from the COPY query
  const items = await db
    .selectFrom("Item")
    .select((eb) => eb.fn.countAll().as("count"))
    .executeTakeFirstOrThrow();
  console.timeLog("etl", `Imported ${items.count} items`);
}

async function importCollections() {
  await db.schema.dropTable("UnrankedCollection").ifExists().cascade().execute();
  await createCollectionTable(db, "UnrankedCollection").execute();

  const response = await fetch(
    `https://dev.kingdomofloathing.com/collections/collections.txt`,
    { headers: { Authorization: `Basic ${auth}` } },
  );

  if (!response.body) {
    console.error("No body");
    return;
  }

  const text = await response.text();

  const client = await pool.connect();
  try {
    const copyStream = client.query(
      copyFrom.from(
        `COPY "UnrankedCollection" ("playerid", "itemid", "quantity") FROM STDIN WITH (HEADER MATCH)`,
      ),
    );
    const source = Readable.from(text);
    await pipeline(source, copyStream);
  } finally {
    client.release();
  }

  // Delete player 6 collections (filtering in COPY WHERE not supported by pg-copy-streams)
  await db
    .deleteFrom("UnrankedCollection")
    .where("playerid", "=", 6)
    .execute();

  // In v4 we can get this from the COPY query
  const collections = await db
    .selectFrom("UnrankedCollection")
    .select((eb) => eb.fn.countAll().as("count"))
    .executeTakeFirstOrThrow();
  console.timeLog("etl", `Imported ${collections.count} collections`);

  const unknownPlayers = await query(`
    DELETE FROM "UnrankedCollection"
    WHERE NOT EXISTS (
      SELECT NULL FROM "Player"
      WHERE "Player"."playerid" = "UnrankedCollection"."playerid"
    )`);
  console.timeLog(
    "etl",
    `Deleted ${unknownPlayers.rowCount} collections from unknown players`,
  );

  await db.schema.dropTable("Collection").ifExists().cascade().execute();
  await createCollectionTable(db, "Collection").execute();
  await query(`
    INSERT INTO "Collection"
    SELECT
      "id" ,
      "playerid",
      "itemid",
      "quantity",
      RANK () OVER (PARTITION BY "itemid" ORDER BY "quantity" DESC) "rank",
      "lastupdated"
    FROM "UnrankedCollection";
  `);

  await query(`TRUNCATE "UnrankedCollection"`);

  console.timeLog("etl", "Ranked collections");
}

async function importData() {
  await importItems();
  await importPlayers();
  await importCollections();
}

async function normaliseData() {
  // Create indexes for case-insensitive searches
  await query(`CREATE EXTENSION IF NOT EXISTS pg_trgm`);
  await query(
    `CREATE INDEX IF NOT EXISTS "Item_name_lower_idx" ON "Item" (lower("name"))`,
  );
  await query(
    `CREATE INDEX IF NOT EXISTS "Item_name_trgm_idx" ON "Item" USING GIN ("name" gin_trgm_ops)`,
  );
  await query(
    `CREATE INDEX IF NOT EXISTS "Player_name_lower_idx" ON "Player" (lower("name"))`,
  );
  await query(
    `CREATE INDEX IF NOT EXISTS "Player_name_trgm_idx" ON "Player" USING GIN ("name" gin_trgm_ops)`,
  );
  await query(
    `CREATE INDEX IF NOT EXISTS "Collection_playerid_idx" ON "Collection" ("playerid")`,
  );
  await query(
    `CREATE INDEX IF NOT EXISTS "Collection_itemid_idx" ON "Collection" ("itemid")`,
  );
  await query(
    `CREATE INDEX IF NOT EXISTS "Collection_rank_idx" ON "Collection" ("rank")`,
  );
  await query(
    `CREATE INDEX IF NOT EXISTS "Collection_itemid_rank_idx" ON "Collection" ("itemid", "rank")`,
  );
  await query(
    `CREATE INDEX IF NOT EXISTS "Item_missing_idx" ON "Item" ("missing")`,
  );
  console.timeLog("etl", "Created indexes");

  // Mark ambiguously named items
  const ambiguous = await query(`
    UPDATE "Item" SET "ambiguous" = true
    FROM (
      SELECT "name", COUNT(*) as "count" FROM "Item"
      GROUP BY "name"
    ) as "s"
    WHERE "s"."count" > 1 AND "s"."name" = "Item"."name"`);
  console.timeLog(
    "etl",
    `Marked ${ambiguous.rowCount} items as ambiguously named`,
  );

  // Add filler items
  const unknownItems = await query(`
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
    )`);
  console.timeLog(
    "etl",
    `Created ${unknownItems.rowCount} filler items because they appear in collections`,
  );

  // Add foreign key relations
  await query(`
    ALTER TABLE "Collection"
      ADD FOREIGN KEY ("itemid") REFERENCES "Item"("itemid") DEFERRABLE INITIALLY DEFERRED,
      ADD FOREIGN KEY ("playerid") REFERENCES "Player"("playerid") DEFERRABLE INITIALLY DEFERRED
  `);

  // Mark new items as seen
  await createItemSeenTable(db).execute();
  const seen = await query(`
    INSERT INTO "ItemSeen" (itemid, "when")
      SELECT DISTINCT c.itemid, CURRENT_DATE
      FROM "Collection" c
      LEFT JOIN "ItemSeen" s ON c.itemid = s.itemid
      WHERE s.itemid IS NULL;
  `);
  console.timeLog("etl", `Marked ${seen.rowCount} items seen for the first time`);
}

async function pickDailyRandomCollections() {
  await db.schema.dropTable("DailyCollection").ifExists().cascade().execute();
  await createDailyCollectionTable(db).execute();

  // Pick the items to include
  await query(`
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
  `);

  // Then fill them with players
  await query(`
    UPDATE "DailyCollection" SET "players" = (
      SELECT json_agg(json_build_object('playerid', "Player"."playerid", 'name', "Player"."name"))
      FROM "Collection"
      LEFT JOIN "Player" ON "Player"."playerid" = "Collection"."playerid"
      WHERE
        "Collection"."rank" = 1 AND
        "Collection"."itemid" = "DailyCollection"."itemid"
    )
  `);

  console.timeLog("etl", "Picked daily collections");
}

async function nextUpdateIn(seconds: number) {
  const timestamp = Date.now() + seconds * 1000;
  await db
    .insertInto("Setting")
    .values({ key: "nextUpdate", value: String(timestamp) })
    .onConflict((oc) => oc.column("key").doUpdateSet({ value: String(timestamp) }))
    .execute();
}

export async function handler() {
  console.time("etl");
  await importData();
  await normaliseData();
  await pickDailyRandomCollections();
  await nextUpdateIn(Number(process.env.SCHEDULE) || 86400);
  console.timeEnd("etl");
}

await handler();
await pool.end();
process.exit();
