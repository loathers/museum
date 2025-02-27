import { db } from "~/db.server";

export async function loader() {
  const items = await db.item.findMany({
    select: {
      itemid: true,
      name: true,
      picture: true,
      descid: true,
      type: true,
      itemclass: true,
      candiscard: true,
      cantransfer: true,
      quest: true,
      gift: true,
      smith: true,
      cook: true,
      cocktail: true,
      jewelry: true,
      multiuse: true,
      sellvalue: true,
      power: true,
      plural: true,
    },
    where: { missing: false, seen: { isNot: null } },
    orderBy: { itemid: "asc" },
  });

  return Response.json(
    items.map((i) => ({
      id: i.itemid,
      name: i.name,
      descid: i.descid,
      image: i.picture,
      type: i.type,
      itemclass: i.itemclass,
      power: i.power,
      multiple: i.multiuse,
      smith: i.smith,
      cook: i.cook,
      mix: i.cocktail,
      jewelry: i.jewelry,
      d: i.candiscard,
      t: i.cantransfer,
      q: i.quest,
      g: i.gift,
      autosell: i.sellvalue,
      plural: i.plural ?? undefined,
    })),
  );
}
