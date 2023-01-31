import { PrismaClient } from "@prisma/client";
import progress from "cli-progress";
import dotenv from "dotenv";
import fetch from "node-fetch";
import { chunkify, notNull } from "./utils.mjs";

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
  await prisma.$executeRaw`SELECT 1`;

  // Load the items from KoL source
  const raw = await load("collections.txt");

  // The easiest sanitization in the world - all you're allowed is digits and whitespace
  if (/[^\d\s]/.test(raw)) {
    console.error("Collections failed anti-sqli. CDM how could you");
    return false;
  }

  const keys = ["playerId", "itemId", "quantity"] as const;

  const collections = raw
    .split("\n")
    .map((l) => {
      const parts = l.split("\t");
      const playerId = Number(parts[0]);
      const itemId = Number(parts[1]);
      if (ignorePlayer.includes(playerId)) return null;
      if (ignoreItem.includes(itemId)) return null;
      return [playerId, itemId, Number(parts[2])] as const;
    })
    .filter(notNull);

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

  bar.start(collections.length, 0);

  const chunks = chunkify(collections, chunkSize);

  for (let i = 0; i < chunks.length; ) {
    try {
      const values = chunks[i].map((c) => `(${c.join(",")})`).join(",");

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
        INSERT INTO "Collection" (${keys.map((k) => `"${k}"`).join(",")})
        VALUES ${values}
        ON CONFLICT ("playerId", "itemId")
        DO UPDATE SET quantity = EXCLUDED.quantity
      `);

      bar.update(++i * chunkSize);
    } catch (e) {
      // "Server stopped responding". This happens on my local machine a lot but I don't think it will
      // happen when we run this in the proper environment.
      if (e.code === "P1017") {
        await new Promise((r) => setTimeout(r, 2000));
        continue;
      }
      throw e;
    }
  }

  bar.stop();
}

async function rankCollections() {
  await Promise.all([
    async function () {
      const total = await prisma.collection.count();

      const bar = new progress.SingleBar(
        {
          format: `Ranking collections [{bar}] {percentage}% | ETA: {eta_formatted} (elapsed: {duration_formatted}) | {value}/{total}`,
          hideCursor: true,
        },
        progress.Presets.shades_classic
      );

      bar.start(total, 0);

      while (bar.getProgress() < total) {
        const result = (await prisma.$queryRaw`
          SELECT COUNT(*) as count
          FROM "Collection"
          WHERE xmax = (
            SELECT backend_xid
            FROM pg_stat_activity
            WHERE state = 'active' AND REGEXP_REPLACE(query, '^[\n ]+', '', 'g') LIKE 'UPDATE%'
            ORDER BY query_start DESC
			      LIMIT 1
          )
        `) as { count: number }[];

        const count = Number(result[0].count);

        if (count === 0 && bar.getProgress() > 0) {
          bar.update(total);
        } else {
          bar.update(count);
        }
      }

      bar.stop();
    },
    prisma.$executeRaw`
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
    `,
  ]);
}

async function main() {
  await updateItems();
  await updatePlayers();
  await updateCollections();
  await rankCollections();
}

main();
