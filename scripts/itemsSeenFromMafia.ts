import { createClient } from "data-of-loathing";

import { sql } from "./db";

const client = createClient();

const knownItems = await client.query({
  allItems: {
    nodes: {
      id: true,
    },
  },
});

const items = (knownItems.allItems?.nodes ?? [])
  .filter((item) => item !== null)
  .map((item) => ({ itemid: item.id }));

let inserted = 0;

const CHUNK = 1000;

for (let i = 0; i < items.length; i += CHUNK) {
  const { count } =
    await sql`INSERT INTO "ItemSeen" ${sql(items.slice(i, i + CHUNK), "itemid")} ON CONFLICT DO NOTHING`;
  inserted += count;
}

console.log(
  `Inserted ${inserted} items about which mafia knows (this includes ignored inserts for items mafia knows about that the Item table doesn't)`,
);
process.exit();
