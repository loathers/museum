import { Item, createClient } from "data-of-loathing";

import { db, pool } from "../db.server";

const client = createClient();
await client.load();

const knownItems = await client.query.find(Item, {}, { orderBy: { id: "ASC" } });
const items = knownItems.map((item) => item.id);

let inserted = 0;

const CHUNK = 1000;

for (let i = 0; i < items.length; i += CHUNK) {
  const chunk = items.slice(i, i + CHUNK);
  const result = await db
    .insertInto("ItemSeen")
    .values(chunk.map((id) => ({ itemid: id })))
    .onConflict((oc) => oc.doNothing())
    .executeTakeFirst();
  inserted += Number(result.numInsertedOrUpdatedRows ?? 0);
}

console.log(
  `Inserted ${inserted} items about which mafia knows (this includes ignored inserts for items mafia knows about that the Item table doesn't)`,
);
await pool.end();
process.exit();
