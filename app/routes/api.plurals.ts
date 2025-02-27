import { db } from "~/db.server";

export async function loader() {
  const items = await db.item.findMany({
    select: { itemid: true, name: true, plural: true },
    where: { missing: false, seen: { isNot: null } },
    orderBy: { itemid: "asc" },
  });

  return Response.json(
    items.map((i) => (i.plural ? i : { ...i, plural: undefined })),
  );
}
