import { Route } from "./+types/api.player.$id";
import { db } from "~/db.server";
import { HttpError } from "~/utils.server";

export async function loader({ params }: Route.LoaderArgs) {
  const id = Number(params.id);

  const player = await db.player.findUnique({
    where: { playerid: id },
    select: {
      playerid: true,
      name: true,
      collections: {
        select: {
          quantity: true,
          rank: true,
          itemid: true,
        },
        orderBy: { itemid: "asc" },
      },
      nameChanges: {
        orderBy: { when: "desc" },
      },
    },
  });

  if (!player)
    return Response.json(
      new HttpError(404, "Player not found with that id").toRouteError(),
      { status: 404 },
    );

  return Response.json(player);
}
