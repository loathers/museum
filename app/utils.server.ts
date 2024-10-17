import { data } from "@remix-run/node";
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
    return data(this.message, {
      status: this.status,
      statusText: HTTP_ERROR_TYPES[this.status] || "Unknown Error",
    });
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

  const item = await db.item.findFirst({
    where: {
      itemid: id,
      missing: false,
    },
    select: {
      name: true,
      description: true,
      picture: true,
      itemid: true,
      ambiguous: true,
      collections: {
        select: {
          quantity: true,
          rank: true,
          player: {
            select: {
              playerid: true,
              name: true,
            },
          },
        },
        orderBy: [{ rank: "asc" }, { player: { name: "asc" } }],
        take,
      },
    },
  });

  if (!item) {
    throw ITEM_NOT_FOUND_ERROR;
  }

  return item;
}
