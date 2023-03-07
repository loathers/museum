import { prisma } from "~/lib/prisma.server";

export async function loader() {
  return await prisma.item.findMany({
    select: { id: true, name: true, plural: true },
    orderBy: { id: "asc" },
  });
}
