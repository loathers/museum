import {
  unstable_defineLoader as defineLoader,
  unstable_data as data,
} from "@remix-run/node";
import { prisma } from "~/lib/prisma.server";

export const loader = defineLoader(async ({ params }) => {
  const id = Number(params.id);

  const player = await prisma.player.findUnique({
    where: { playerid: id },
    select: {
      playerid: true,
      name: true,
      collections: {
        select: {
          quantity: true,
          rank: true,
          itemid: true,
        },
        orderBy: { itemid: "asc" },
      },
      nameChanges: {
        orderBy: { when: "desc" },
      },
    },
  });

  if (!player) return data("Player not found with that id", { status: 404 });

  return player;
});
