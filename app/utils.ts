import { json } from "@remix-run/node";
import { decodeHTML } from "entities";
import { prisma } from "./lib/prisma.server";

export const plural = (item: { plural?: string | null; name: string }) => {
  return item.plural || item.name + "s";
};

export function englishJoin(elements: React.ReactNode[]) {
  if (elements.length === 0) return null;
  if (elements.length === 1) return elements[0];
  return elements.map((el, i) => [
    i === 0 ? null : i === elements.length - 1 ? " and " : ", ",
    el,
  ]);
}

export type SlimItem = { id: number; name: string; ambiguous: boolean };

export function itemToString(
  item: SlimItem | null | undefined,
  disambiguate = false,
  usePlural = false,
) {
  return item
    ? `${item.ambiguous && disambiguate ? `[${item.id}]` : ""}${decodeHTML(
        usePlural ? plural(item) : item.name,
      ).replace(/(<([^>]+)>)/gi, "")}`
    : "";
}

export class HttpError {
  message: string;
  status: number;

  constructor(status: number, message: string) {
    this.status = status;
    this.message = message;
  }

  toRouteError() {
    return json(this.message, {
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

  const item = await prisma.item.findFirst({
    where: {
      id,
      missing: false,
    },
    include: {
      collection: {
        select: {
          quantity: true,
          rank: true,
          player: true,
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
