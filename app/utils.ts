import { decodeHTML } from "entities";
import { prisma } from "./lib/prisma.server";

export const plural = (item: { plural?: string | null, name: string }) => {
    return item.plural || item.name + "s";
}

export function englishJoin(elements: React.ReactNode[]) {
  if (elements.length === 0) return null;
  if (elements.length === 1) return elements[0];
  return elements.map((el, i) => [
    i === 0 ? null : i === elements.length - 1 ? " and " : ", ",
    el,
  ]);
}

export type SlimItem = { id: number, name: string, ambiguous: boolean };

export function itemToString(item: SlimItem | null, disambiguate = false, usePlural = false) {
  return item
    ? `${item.ambiguous && disambiguate ? `[${item.id}]` : ""}${decodeHTML(
        usePlural ? plural(item) : item.name
      ).replace(/(<([^>]+)>)/gi, "")}`
    : "";
}

export class HTTPError {
  message: string;
  status: number;

  constructor(message: string, status = 500) {
    this.message = message;
    this.status = status;
  }
}

export async function loadCollections(id: number, take = 999) {
  if (!id) throw new HTTPError("An item id must be specified", 400);
  if (id >= 2 ** 31) throw new HTTPError("Item not found with that id", 404);

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

  if (!item || item.collection.length === 0) {
    throw new HTTPError("Item not found with that id", 404);
  }

  return item;
}