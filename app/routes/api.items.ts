import { Route } from "./+types/api.items";
import { db } from "~/db.server";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);

  const q = url.searchParams.get("q");

  if (!q) return Response.json([]);

  const items = await db.item.findMany({
    where: {
      missing: false,
      name: {
        contains: q,
        mode: "insensitive",
      },
      seen: { isNot: null },
    },
    select: {
      name: true,
      itemid: true,
      ambiguous: true,
    },
    orderBy: [{ name: "asc" }, { itemid: "asc" }],
    take: 50,
  });

  return Response.json(items);
}
