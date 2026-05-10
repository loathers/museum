import { Route } from "./+types/api.player.$id";
import { db } from "~/db.server";
import { HttpError } from "~/utils.server";

export async function loader({ params }: Route.LoaderArgs) {
  const id = Number(params.id);

  const player = await db
    .selectFrom("Player")
    .select(["playerid", "name"])
    .where("playerid", "=", id)
    .executeTakeFirst();

  if (!player)
    return Response.json(
      new HttpError(404, "Player not found with that id").toRouteError(),
      { status: 404 },
    );

  const collections = await db
    .selectFrom("Collection")
    .select(["quantity", "rank", "itemid"])
    .where("playerid", "=", id)
    .orderBy("itemid", "asc")
    .execute();

  const nameChanges = await db
    .selectFrom("PlayerNameChange")
    .select(["oldname", "when"])
    .where("playerid", "=", id)
    .orderBy("when", "desc")
    .execute();

  return Response.json({
    ...player,
    collections,
    nameChanges,
  });
}
