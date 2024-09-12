import { unstable_data as data, LoaderFunctionArgs } from "@remix-run/node";
import { db } from "~/db.server";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const id = Number(params.id);

  const player = await db.player.findUnique({
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
};
