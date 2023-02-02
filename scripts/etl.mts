import { PrismaClient } from "@prisma/client";
import progress from "cli-progress";
import dotenv from "dotenv";
import fs from "fs/promises";
import fetch from "node-fetch";
import path from "path";

// Load environment from .env
dotenv.config();

const prisma = new PrismaClient();

const auth = Buffer.from(
  `${process.env.KOL_HTTP_USERNAME}:${process.env.KOL_HTTP_PASSWORD}`
).toString("base64");

async function load(file: string) {
  // Construct request
  const response = await fetch(
    `https://dev.kingdomofloathing.com/collections/${file}`,
    { headers: { Authorization: `Basic ${auth}` } }
  );

  // Download with progress
  const reader = response.body;

  if (!reader) return "";

  const bar = new progress.SingleBar(
    {
      format: `Downloading ${file} [{bar}] {percentage}% | ETA: {eta_formatted} (elapsed: {duration_formatted}) | {value}/{total}`,
      hideCursor: true,
    },
    progress.Presets.shades_classic
  );

  const contentLength = Number(response.headers.get("Content-Length") ?? 0);

  bar.start(contentLength, 0);

  const chunks = [] as Buffer[];

  for await (const chunk of reader) {
    bar.increment(chunk.length);
    chunks.push(chunk as Buffer);
  }

  const allChunks = new Uint8Array(
    chunks.reduce((acc, c) => acc + c.length, 0)
  );
  let position = 0;
  for (let chunk of chunks) {
    allChunks.set(chunk as Buffer, position);
    position += chunk.length;
  }

  bar.stop();

  const text = new TextDecoder("utf-8").decode(allChunks);

  return text
    .substring(text.indexOf("\n")) // Remove first line (header)
    .replace(/\n\\n/g, "\n") // Remove actual newlines from item descriptions
    .trim(); // Remove training whitespace
}

async function updateItems() {
  // Load the items from KoL source
  const raw = await load("items.txt");

  const items = raw.split("\n").map((l) => {
    const parts = l.split("\t");

    return {
      id: Number(parts[0]),
      name: parts[1],
      plural: parts[21] || null,
      picture: parts[2],
      description: parts[4],
    };
  });

  const start = Date.now();
  process.stdout.write(`Importing ${items.length} items`);
  process.stdout.write("\x1B[?25l");

  // Insert them all
  // This won't update old items. Until `upsertMany` is added, I'll leave it like this
  const results = await prisma.item.createMany({
    data: items,
    skipDuplicates: true,
  });

  process.stdout.clearLine(0);
  process.stdout.cursorTo(0);
  process.stdout.write("\x1B[?25h");
  console.log(
    `Imported ${items.length} items (${results.count} added) in ${Math.round(
      (Date.now() - start) / 1000
    )}s`
  );
}

async function markAmbiguousItems() {
  process.stdout.write(`Marking ambiguous item names`);
  process.stdout.write("\x1B[?25l");

  const results = await prisma.$executeRaw`
    UPDATE "Item"
    SET "ambiguous" = TRUE
    WHERE "name" IN (
      SELECT "name" FROM "Item"
      GROUP BY "name"
      HAVING COUNT(*) > 1
    )
  `;

  process.stdout.clearLine(0);
  process.stdout.cursorTo(0);
  process.stdout.write("\x1B[?25h");
  console.log(` Marked ${results} ambiguous item names`);
}

async function updatePlayers() {
  // Load the items from KoL source
  const raw = await load("player.txt");

  const players = raw.split("\n").map((l) => {
    const parts = l.split("\t");

    return {
      id: Number(parts[0]),
      name: parts[1],
    };
  });

  const start = Date.now();
  process.stdout.write(`Importing ${players.length} players`);
  process.stdout.write("\x1B[?25l");

  // Insert them all
  // This won't update old items. Until `upsertMany` is added, I'll leave it like this
  const results = await prisma.player.createMany({
    data: players,
    skipDuplicates: true,
  });

  process.stdout.clearLine(0);
  process.stdout.cursorTo(0);
  process.stdout.write("\x1B[?25h");
  console.log(
    `Imported ${players.length} players (${
      results.count
    } added) in ${Math.round((Date.now() - start) / 1000)}s`
  );
}

const ignorePlayer = [6, 589227, 690946, 830230, 1374389, 3056907];
const ignoreItem = [745, 1223, 5904, 11027];

async function updateCollections() {
  // Load the items from KoL source
  const raw = await load("collections.txt");

  // The easiest sanitization in the world - all you're allowed is digits and whitespace
  if (/[^\d\s]/.test(raw)) {
    console.error("Collections failed anti-sqli. CDM how could you");
    return false;
  }

  const total = (raw.match(/\n/g)?.length || 0) + 1;

  // 250 seems to be the greatest chunk size that is 100% stable,
  // at least with the single db deployment I have at time of writing.
  const chunkSize = 250;

  const bar = new progress.SingleBar(
    {
      format: `Importing collections [{bar}] {percentage}% | ETA: {eta_formatted} (elapsed: {duration_formatted}) | {value}/{total}`,
      hideCursor: true,
    },
    progress.Presets.shades_classic
  );

  bar.start(total, 0);

  let chunk = [] as [playerId: number, itemId: number, quantity: number][];
  let cursor = 0;

  const keys = ["playerId", "itemId", "quantity"] as const;
  const keysString = keys.map((k) => `"${k}"`).join(",");

  let i = 0;

  while (cursor >= 0) {
    const next = raw.indexOf("\n", cursor);

    if (next > 0) {
      const line = raw.substring(cursor, next);
      cursor = next + 1;

      const parts = line.split("\t");
      const playerId = Number(parts[0]);
      const itemId = Number(parts[1]);
      if (ignorePlayer.includes(playerId)) continue;
      if (ignoreItem.includes(itemId)) continue;

      chunk.push([playerId, itemId, Number(parts[2])]);
    } else {
      cursor = -1;
    }

    if (chunk.length < chunkSize && cursor >= 0) continue;

    i += chunk.length;
    const values = chunk.map((c) => `(${c.join(",")})`).join(",");
    chunk = [];

    // This query is still problematic because of the fk constraints on Player and Item.
    // The incoming data quality isn't amazing and often there will be collections for
    // non-existent players and non-public items. For now I have a manual list of
    // skippable player and item ids.
    //
    // For players: I want to rewrite this to use a CTE and only insert for players
    // that exist in the db already (a la https://stackoverflow.com/a/68540209)
    //
    // For items: I want to insert an item row manually for any missing. I think it would
    // be acceptable to generate a report of missing items to be done manually. Such rows
    // can be marked as seed data via Prisma which will ensure they are available for any
    // instances.
    //
    // Once I've done the new query 'm thinking that I can just compare rows-added actual to
    // rows-added expected and only perform slow comparisons when that number is not the same.

    await prisma.$executeRawUnsafe(`
      INSERT INTO "Collection" (${keysString})
      VALUES ${values}
      ON CONFLICT ("playerId", "itemId")
      DO UPDATE SET quantity = EXCLUDED.quantity
    `);

    bar.update(i);
  }

  bar.update(total);

  bar.stop();
}

async function rankCollections() {
  process.stdout.write(`Ranking collections`);
  process.stdout.write("\x1B[?25l");

  const results = await prisma.$executeRaw`
    UPDATE "Collection"
    SET "rank" = ranking.rank_number
    FROM (
      SELECT "itemId", 
        "playerId", 
        "quantity", 
        RANK () OVER (PARTITION BY "itemId" ORDER BY quantity DESC) rank_number
      FROM "Collection"
    ) as ranking
    WHERE "Collection"."playerId" = ranking."playerId" AND "Collection"."itemId" = ranking."itemId"
  `;

  process.stdout.clearLine(0);
  process.stdout.cursorTo(0);
  process.stdout.write("\x1B[?25h");
  console.log(` Ranked ${results} collections`);
}

async function main() {
  await prisma.$queryRaw`SELECT 1`;
  await updateItems();
  await markAmbiguousItems();
  await updatePlayers();
  await updateCollections();
  await rankCollections();
}

main();
