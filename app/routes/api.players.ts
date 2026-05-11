import { sql } from "kysely";

import { Route } from "./+types/api.players";
import { db } from "~/db.server";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);

  const q = url.searchParams.get("q");

  if (!q) return Response.json([]);

  const players = await db
    .selectFrom("Player")
    .select(["name", "playerid"])
    .where(sql<boolean>`"name" ilike ${`%${q}%`}`)
    .orderBy("name", "asc")
    .limit(50)
    .execute();

  return Response.json(players);
}
