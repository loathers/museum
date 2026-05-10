import { Route } from "./+types/api.player.$id";
import { db } from "~/db.server";
import { HttpError } from "~/utils.server";

export async function loader({ params }: Route.LoaderArgs) {
  const id = Number(params.id);

  const [rows, nameChanges] = await Promise.all([
    db
      .selectFrom("Player")
      .leftJoin("Collection", "Collection.playerid", "Player.playerid")
      .select([
        "Player.playerid",
        "Player.name",
        "Collection.quantity",
        "Collection.rank",
        "Collection.itemid",
      ])
      .where("Player.playerid", "=", id)
      .orderBy("Collection.itemid", "asc")
      .execute(),
    db
      .selectFrom("PlayerNameChange")
      .select(["oldname", "when"])
      .where("playerid", "=", id)
      .orderBy("when", "desc")
      .execute(),
  ]);

  if (rows.length === 0)
    return Response.json(
      new HttpError(404, "Player not found with that id").toRouteError(),
      { status: 404 },
    );

  const { playerid, name } = rows[0];
  const collections =
    rows[0].itemid === null
      ? []
      : rows.map(({ quantity, rank, itemid }) => ({ quantity, rank, itemid }));

  return Response.json({ playerid, name, collections, nameChanges });
}
