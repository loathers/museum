import { prisma } from "~/lib/prisma.server";

export async function loader() {
  return await prisma.item.findMany({
    select: { itemid: true, name: true, plural: true },
    where: { missing: false },
    orderBy: { itemid: "asc" },
  });
}
