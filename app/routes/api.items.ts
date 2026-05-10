import { sql } from "kysely";

import { Route } from "./+types/api.items";
import { db } from "~/db.server";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);

  const q = url.searchParams.get("q");

  if (!q) return Response.json([]);

  const items = await db
    .selectFrom("Item")
    .innerJoin("ItemSeen", "ItemSeen.itemid", "Item.itemid")
    .select(["Item.name", "Item.itemid", "Item.ambiguous"])
    .where("Item.missing", "=", false)
    .where(sql<boolean>`"Item"."name" ilike ${`%${q}%`}`)
    .orderBy("Item.name", "asc")
    .orderBy("Item.itemid", "asc")
    .limit(50)
    .execute();

  return Response.json(items);
}
