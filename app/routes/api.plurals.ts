import { db } from "~/db.server";

export async function loader() {
  const items = await db
    .selectFrom("Item")
    .innerJoin("ItemSeen", "ItemSeen.itemid", "Item.itemid")
    .select(["Item.itemid", "Item.name", "Item.plural"])
    .where("Item.missing", "=", false)
    .orderBy("Item.itemid", "asc")
    .execute();

  return Response.json(
    items.map((i) => (i.plural ? i : { ...i, plural: undefined })),
  );
}
