import { Readable } from "stream";
import { pipeline } from "stream/promises";
import copyFrom from "pg-copy-streams";
import { sql } from "kysely";

import { db, pool } from "../db.server";

const auth = Buffer.from(
  `${process.env.KOL_HTTP_USERNAME}:${process.env.KOL_HTTP_PASSWORD}`,
).toString("base64");

async function importPlayers() {
  await sql`TRUNCATE "PlayerNew"`.execute(db);

  const response = await fetch(
    `https://dev.kingdomofloathing.com/collections/player.txt`,
    { headers: { Authorization: `Basic ${auth}` } },
  );

  const lines = (await response.text())
    .replace(/\n\\n/g, "\n")
    .replace(/\r/g, "")
    .split("\n");

  // Keep header, filter out rows with a NULL name (second tab-separated field)
  const [header, ...rows] = lines;
  const text = [header, ...rows.filter((row) => row.split("\t")[1] !== "NULL")].join("\n");

  const client = await pool.connect();
  try {
    const copyStream = client.query(
      copyFrom.from(
        `COPY "PlayerNew" ("playerid", "name", "clan", "description") FROM STDIN WITH (HEADER MATCH, NULL 'NULL')`,
      ),
    );
    await pipeline(Readable.from(text), copyStream);
  } finally {
    client.release();
  }

  const nameChanges = await db
    .insertInto("PlayerNameChange")
    .columns(["playerid", "oldname"])
    .expression(
      db
        .selectFrom("PlayerNew")
        .leftJoin("Player", "Player.playerid", "PlayerNew.playerid")
        .select(["PlayerNew.playerid", "Player.name as oldname"])
        .where(sql`lower("PlayerNew"."name")`, "!=", sql`lower("Player"."name")`),
    )
    .onConflict((oc) => oc.doNothing())
    .executeTakeFirst();

  await sql`ALTER TABLE "Player" DISABLE TRIGGER ALL`.execute(db);
  await sql`ALTER TABLE "Collection" DISABLE TRIGGER ALL`.execute(db);
  await db.deleteFrom("Player").execute();
  await db
    .insertInto("Player")
    .expression(
      db.selectFrom("PlayerNew").select(["playerid", "name", "clan", "description"]),
    )
    .execute();
  await sql`ALTER TABLE "Player" ENABLE TRIGGER ALL`.execute(db);
  await sql`ALTER TABLE "Collection" ENABLE TRIGGER ALL`.execute(db);
  await sql`TRUNCATE "PlayerNew"`.execute(db);

  const players = await db
    .selectFrom("Player")
    .select((eb) => eb.fn.countAll().as("count"))
    .executeTakeFirstOrThrow();
  console.timeLog(
    "etl",
    `Imported ${players.count} players and noticed ${nameChanges?.numInsertedOrUpdatedRows ?? 0} name changes`,
  );
}

async function importItems() {
  await sql`TRUNCATE "ItemStaging"`.execute(db);

  const response = await fetch(
    `https://dev.kingdomofloathing.com/collections/items.txt`,
    { headers: { Authorization: `Basic ${auth}` } },
  );

  const text = (await response.text())
    .replace(/\n\\n/g, "\n")
    .replace(/\r/g, "");

  const client = await pool.connect();
  try {
    const copyStream = client.query(
      copyFrom.from(
        `COPY "ItemStaging" ("itemid", "name", "picture", "descid", "description", "type", "itemclass", "candiscard", "cantransfer", "quest", "gift", "smith", "cook", "cocktail", "jewelry", "hands", "multiuse", "sellvalue", "power", "quest2", "mrstore", "plural") FROM STDIN WITH (HEADER)`,
      ),
    );
    await pipeline(Readable.from(text), copyStream);
  } finally {
    client.release();
  }

  await db
    .updateTable("ItemStaging")
    .set({ plural: null })
    .where("plural", "=", "")
    .execute();

  await sql`DROP INDEX IF EXISTS "Item_missing_idx"`.execute(db);
  await sql`DROP INDEX IF EXISTS "Item_name_lower_idx"`.execute(db);
  await sql`DROP INDEX IF EXISTS "Item_name_trgm_idx"`.execute(db);

  await sql`TRUNCATE "Item" CASCADE`.execute(db);
  await db
    .insertInto("Item")
    .expression(
      db.selectFrom("ItemStaging").select([
        "itemid", "name", "picture", "descid", "description", "type", "itemclass",
        "candiscard", "cantransfer", "quest", "gift", "smith", "cook", "cocktail",
        "jewelry", "hands", "multiuse", "sellvalue", "power", "quest2", "mrstore",
        "plural", "ambiguous", "missing",
      ]),
    )
    .execute();

  await sql`CREATE INDEX "Item_missing_idx" ON "Item" ("missing")`.execute(db);
  await sql`CREATE INDEX "Item_name_lower_idx" ON "Item" (lower("name"))`.execute(db);
  await sql`CREATE INDEX "Item_name_trgm_idx" ON "Item" USING GIN ("name" gin_trgm_ops)`.execute(db);

  const items = await db
    .selectFrom("Item")
    .select((eb) => eb.fn.countAll().as("count"))
    .executeTakeFirstOrThrow();
  console.timeLog("etl", `Imported ${items.count} items`);
}

async function importCollections() {
  await sql`TRUNCATE "UnrankedCollection"`.execute(db);

  const response = await fetch(
    `https://dev.kingdomofloathing.com/collections/collections.txt`,
    { headers: { Authorization: `Basic ${auth}` } },
  );

  if (!response.body) {
    console.error("No body");
    return;
  }

  const client = await pool.connect();
  try {
    const copyStream = client.query(
      copyFrom.from(
        `COPY "UnrankedCollection" ("playerid", "itemid", "quantity") FROM STDIN WITH (HEADER MATCH)`,
      ),
    );
    await pipeline(Readable.from(await response.text()), copyStream);
  } finally {
    client.release();
  }

  await db.deleteFrom("UnrankedCollection").where("playerid", "=", 6).execute();

  const collections = await db
    .selectFrom("UnrankedCollection")
    .select((eb) => eb.fn.countAll().as("count"))
    .executeTakeFirstOrThrow();
  console.timeLog("etl", `Imported ${collections.count} collections`);

  const unknownPlayers = await db
    .deleteFrom("UnrankedCollection")
    .where(({ not, exists, selectFrom }) =>
      not(
        exists(
          selectFrom("Player")
            .select(sql.lit(null).as("x"))
            .whereRef("Player.playerid", "=", "UnrankedCollection.playerid"),
        ),
      ),
    )
    .executeTakeFirst();
  console.timeLog(
    "etl",
    `Deleted ${unknownPlayers?.numDeletedRows ?? 0} collections from unknown players`,
  );

  const unknownItems = await db
    .insertInto("Item")
    .columns(["itemid", "name", "description", "missing"])
    .expression(
      db
        .selectFrom("UnrankedCollection")
        .select([
          "UnrankedCollection.itemid",
          sql.lit("Unknown").as("name"),
          sql
            .lit("Museum heard that this item exists but doesn't know anything about it!")
            .as("description"),
          sql.lit(true).as("missing"),
        ])
        .distinctOn("UnrankedCollection.itemid")
        .where(({ not, exists, selectFrom }) =>
          not(
            exists(
              selectFrom("Item")
                .select(sql.lit(null).as("x"))
                .whereRef("Item.itemid", "=", "UnrankedCollection.itemid"),
            ),
          ),
        ),
    )
    .executeTakeFirst();
  console.timeLog(
    "etl",
    `Created ${unknownItems?.numInsertedOrUpdatedRows ?? 0} filler items because they appear in collections`,
  );

  await sql`DROP INDEX IF EXISTS "Collection_itemid_idx"`.execute(db);
  await sql`DROP INDEX IF EXISTS "Collection_itemid_rank_idx"`.execute(db);
  await sql`DROP INDEX IF EXISTS "Collection_playerid_idx"`.execute(db);
  await sql`DROP INDEX IF EXISTS "Collection_rank_idx"`.execute(db);

  await sql`TRUNCATE "Collection"`.execute(db);
  await db
    .insertInto("Collection")
    .expression(
      db.selectFrom("UnrankedCollection").select([
        "id",
        "playerid",
        "itemid",
        "quantity",
        sql<number>`RANK() OVER (PARTITION BY "itemid" ORDER BY "quantity" DESC)`.as("rank"),
        "lastupdated",
      ]),
    )
    .execute();

  await sql`CREATE INDEX "Collection_itemid_idx" ON "Collection" ("itemid")`.execute(db);
  await sql`CREATE INDEX "Collection_itemid_rank_idx" ON "Collection" ("itemid", "rank")`.execute(db);
  await sql`CREATE INDEX "Collection_playerid_idx" ON "Collection" ("playerid")`.execute(db);
  await sql`CREATE INDEX "Collection_rank_idx" ON "Collection" ("rank")`.execute(db);

  await sql`TRUNCATE "UnrankedCollection"`.execute(db);

  console.timeLog("etl", "Ranked collections");
}

async function importData() {
  await importItems();
  await importPlayers();
  await importCollections();
}

async function normaliseData() {
  const ambiguous = await db
    .updateTable("Item")
    .set({ ambiguous: true })
    .from(
      db
        .selectFrom("Item")
        .select(["name"])
        .select((eb) => eb.fn.countAll().as("count"))
        .groupBy("name")
        .as("s"),
    )
    .whereRef("s.name", "=", "Item.name")
    .where("s.count", ">", "1")
    .executeTakeFirst();
  console.timeLog(
    "etl",
    `Marked ${ambiguous?.numUpdatedRows ?? 0} items as ambiguously named`,
  );

  const seen = await db
    .insertInto("ItemSeen")
    .columns(["itemid", "when"])
    .expression(
      db
        .selectFrom("Collection as c")
        .leftJoin("ItemSeen as s", "s.itemid", "c.itemid")
        .select([
          "c.itemid",
          sql`CURRENT_DATE`.as("when"),
        ])
        .distinctOn("c.itemid")
        .where("s.itemid", "is", null),
    )
    .executeTakeFirst();
  console.timeLog(
    "etl",
    `Marked ${seen?.numInsertedOrUpdatedRows ?? 0} items seen for the first time`,
  );
}

async function pickDailyRandomCollections() {
  await sql`TRUNCATE "DailyCollection"`.execute(db);

  await db
    .insertInto("DailyCollection")
    .columns(["itemid", "name", "plural", "players"])
    .expression(
      db
        .selectFrom(
          db
            .selectFrom("Collection")
            .select("itemid")
            .where("rank", "=", 1)
            .where("quantity", ">", 1)
            .groupBy("itemid")
            .orderBy(sql`RANDOM()`)
            .limit(10)
            .as("Collection"),
        )
        .leftJoin("Item", "Collection.itemid", "Item.itemid")
        .select([
          "Collection.itemid",
          "Item.name",
          "Item.plural",
          sql`'[]'::json`.as("players"),
        ]),
    )
    .execute();

  await db
    .updateTable("DailyCollection")
    .set((eb) => ({
      players: eb
        .selectFrom("Collection")
        .leftJoin("Player", "Player.playerid", "Collection.playerid")
        .select(
          sql`json_agg(json_build_object('playerid', "Player"."playerid", 'name', "Player"."name"))`.as(
            "players",
          ),
        )
        .where("Collection.rank", "=", 1)
        .where("Collection.itemid", "=", eb.ref("DailyCollection.itemid")),
    }))
    .execute();

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
