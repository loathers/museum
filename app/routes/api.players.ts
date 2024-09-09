import { unstable_defineLoader as defineLoader } from "@remix-run/node";
import { prisma } from "~/lib/prisma.server";

export const loader = defineLoader(async ({ request }) => {
  const url = new URL(request.url);

  const q = url.searchParams.get("q");

  if (!q) return [];

  const players = await prisma.player.findMany({
    where: {
      name: {
        contains: q,
        mode: "insensitive",
      },
    },
    select: {
      name: true,
      playerid: true,
    },
    orderBy: [{ name: "asc" }],
  });

  return players;
});
