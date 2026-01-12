import { Route } from "./+types/api.players";
import { db } from "~/db.server";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);

  const q = url.searchParams.get("q");

  if (!q) return Response.json([]);

  const players = await db.player.findMany({
    where: {
      name: {
        contains: q,
        mode: "insensitive",
      },
    },
    select: {
      name: true,
      playerid: true,
    },
    orderBy: [{ name: "asc" }],
    take: 50,
  });

  return Response.json(players);
}
