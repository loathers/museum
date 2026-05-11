import { db } from "./db.server";

export type SlimItem = { itemid: number; name: string; ambiguous: boolean };

export class HttpError {
  message: string;
  status: number;

  constructor(status: number, message: string) {
    this.status = status;
    this.message = message;
  }

  toRouteError() {
    return Response.json(
      { status: this.status, message: this.message },
      {
        status: this.status,
        statusText: HTTP_ERROR_TYPES[this.status] || "Unknown Error",
      },
    );
  }
}

export const ITEM_NOT_FOUND_ERROR = new HttpError(
  404,
  "That item, if it exists at all, has no collections.",
);

const HTTP_ERROR_TYPES: { [key: number]: string } = {
  404: "Not Found",
  400: "Bad Request",
  500: "Internal Server Error",
};

export async function loadCollections(id: number, take = 999) {
  if (!id) throw new HttpError(400, "An item id must be specified");
  if (id >= 2 ** 31) throw ITEM_NOT_FOUND_ERROR;

  // Query 1: Get item with existence check via join
  const item = await db
    .selectFrom("Item")
    .innerJoin("ItemSeen", "ItemSeen.itemid", "Item.itemid")
    .select([
      "Item.name",
      "Item.description",
      "Item.picture",
      "Item.itemid",
      "Item.ambiguous",
    ])
    .where("Item.itemid", "=", id)
    .where("Item.missing", "=", false)
    .executeTakeFirst();

  if (!item) {
    throw ITEM_NOT_FOUND_ERROR;
  }

  // Query 2: Get collections with player data via JOIN
  const collections = await db
    .selectFrom("Collection")
    .innerJoin("Player", "Player.playerid", "Collection.playerid")
    .select([
      "Collection.quantity",
      "Collection.rank",
      "Player.playerid",
      "Player.name as playerName",
    ])
    .where("Collection.itemid", "=", id)
    .orderBy("Collection.rank", "asc")
    .orderBy("Player.name", "asc")
    .limit(take)
    .execute();

  return {
    ...item,
    collections: collections.map((c) => ({
      quantity: c.quantity,
      rank: c.rank,
      player: { playerid: c.playerid, name: c.playerName },
    })),
  };
}
