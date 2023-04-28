import { Prisma, PrismaClient } from "@prisma/client";
import progress from "cli-progress";
import dotenv from "dotenv";
import fetch from "node-fetch";

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

  const bar = new progress.SingleBar(
    {
      format: `Importing items [{bar}] {percentage}% | ETA: {eta_formatted} (elapsed: {duration_formatted}) | {value}/{total}`,
      hideCursor: true,
    },
    progress.Presets.shades_classic
  );

  bar.start(items.length, 0);

  // Insert them all
  for (const item of items) {
    await prisma.item.upsert({
      where: { id: item.id },
      update: {
        name: item.name,
        plural: item.plural,
        picture: item.picture,
        description: item.description,
      },
      create: item,
    });
    bar.increment();
  }

  bar.stop();
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
  console.log(`Marked ${results} ambiguous item names`);
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

async function updateCollections() {
  // Load known players to ignore
  const ignorePlayer = (await prisma.player.findMany({ where: { missing: true }, select: { id: true } }))
    .map(({ id }) => id);

  // A classic piece of advice: always ignore MC
  ignorePlayer.push(6);

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
    const previousCursor = cursor;
    const next = raw.indexOf("\n", cursor);

    if (next > 0) {
      const line = raw.substring(cursor, next);
      cursor = next + 1;

      const parts = line.split("\t");
      const playerId = Number(parts[0]);
      const itemId = Number(parts[1]);
      if (ignorePlayer.includes(playerId)) continue;

      chunk.push([playerId, itemId, Number(parts[2])]);
    } else {
      cursor = -1;
    }

    if (chunk.length < chunkSize && cursor >= 0) continue;

    const values = chunk.map((c) => `(${c.join(",")})`).join(",");

    try {
      await prisma.$executeRawUnsafe(`
        INSERT INTO "Collection" (${keysString})
        VALUES ${values}
        ON CONFLICT ("playerId", "itemId")
        DO UPDATE SET quantity = EXCLUDED.quantity
      `);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.meta?.code === "23503") {
        for (const [playerId, itemId,] of chunk) {
          const playerExists = await prisma.player.findUnique({ where: { id: playerId }}) !== null;

          if (!playerExists) {
            await prisma.player.create({ data: { id: playerId, name: "Unknown Player", missing: true } });
            ignorePlayer.push(playerId)
          }

          const itemExists = await prisma.item.findUnique({ where: { id: itemId }}) !== null;

          if (!itemExists) {
            await prisma.item.create({
              data: {
                id: itemId,
                name: "Unknown",
                description: "Museum heard that this item exists but doesn't know anything about it!",
                picture: "nopic.gif",
                missing: true
              }
            });
          }
        }

        cursor = previousCursor;
        chunk = [];

        // Continue now to re-try this chunk
        continue;
      }

      // Otherwise rethrow this error
      throw err;
    }

    i += chunk.length;
    chunk = [];

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
  console.log(`Ranked ${results} collections`);
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
