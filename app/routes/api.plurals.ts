import { db } from "~/db.server";

export const loader = async () => {
  const items = await db.item.findMany({
    select: { itemid: true, name: true, plural: true },
    where: { missing: false },
    orderBy: { itemid: "asc" },
  });

  return items.map((i) => (i.plural ? i : { ...i, plural: undefined }));
};
