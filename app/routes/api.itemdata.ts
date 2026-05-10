import { db } from "~/db.server";

export async function loader() {
  const items = await db
    .selectFrom("Item")
    .innerJoin("ItemSeen", "ItemSeen.itemid", "Item.itemid")
    .select([
      "Item.itemid",
      "Item.name",
      "Item.picture",
      "Item.descid",
      "Item.type",
      "Item.itemclass",
      "Item.candiscard",
      "Item.cantransfer",
      "Item.quest",
      "Item.gift",
      "Item.smith",
      "Item.cook",
      "Item.cocktail",
      "Item.jewelry",
      "Item.multiuse",
      "Item.sellvalue",
      "Item.power",
      "Item.plural",
    ])
    .where("Item.missing", "=", false)
    .orderBy("Item.itemid", "asc")
    .execute();

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
