import { LoaderFunctionArgs } from "@remix-run/node";
import { prisma } from "~/lib/prisma.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  const q = url.searchParams.get("q");

  if (!q) return [];

  const items = await prisma.item.findMany({
    where: {
      missing: false,
      name: {
        contains: q,
        mode: "insensitive",
      },
    },
    select: {
      name: true,
      itemid: true,
      ambiguous: true,
      _count: { select: { collections: true } },
    },
    orderBy: [{ name: "asc" }, { itemid: "asc" }],
  });

  return items.filter((i) => i._count.collections > 0);
};
