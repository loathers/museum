import { type LoaderFunctionArgs } from "react-router";

import { db } from "~/db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  const q = url.searchParams.get("q");

  if (!q) return [];

  const players = await db.player.findMany({
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
};
