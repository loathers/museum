import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { prisma } from "~/lib/prisma.server";

export async function loader({ params }: LoaderFunctionArgs) {
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

  if (!player) throw json("Player not found with that id", { status: 404 });

  return json(player);
}
