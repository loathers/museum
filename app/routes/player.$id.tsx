import { prisma } from "~/lib/prisma.server";
import type { LoaderArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import PlayerPageRanking from "~/components/PlayerPageRanking";
import Formerly from "~/components/Formerly";

const normalizeSort = (sort: string | null) => {
  switch (sort) {
    case "rank":
    case "quantity":
      return sort;
    default:
      return "name";
  }
};

const sortToOrderByQuery = (sort: ReturnType<typeof normalizeSort>) => {
  switch (sort) {
    case "rank":
      return { rank: "asc" as const };
    case "quantity":
      return { quantity: "desc" as const };
    default:
      return { item: { name: "asc" as const } };
  }
};

export async function loader({ params, request }: LoaderArgs) {
  const id = Number(params.id);

  if (!id) throw json("A player id must be specified", { status: 400 });
  if (id >= 2 ** 31)
    throw json("Player not found with that id", { status: 404 });

  const url = new URL(request.url);
  const sort = normalizeSort(url.searchParams.get("sort"));

  const orderBy = sortToOrderByQuery(sort);

  const player = await prisma.player.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      collection: {
        select: {
          quantity: true,
          rank: true,
          item: true,
        },
        orderBy: [orderBy, { item: { id: "asc" as const } }],
      },
      playerNameChange: {
        orderBy: { when: "desc" },
      },
    },
  });

  if (!player) throw json("Player not found with that id", { status: 404 });

  return { player, sort };
}

export const meta: MetaFunction<typeof loader> = ({ data: { player } }) => {
  return {
    title: `Museum :: ${player.name}`,
  };
};

const currentSort: React.CSSProperties = {
  textDecoration: "none",
  color: "inherit",
  pointerEvents: "none",
  fontWeight: "bold",
};

export default function Player() {
  const { player, sort } = useLoaderData<typeof loader>();

  return (
    <div
      style={{
        fontFamily: "system-ui, sans-serif",
        lineHeight: "1.4",
        textAlign: "center",
        maxWidth: 780,
        padding: "0 20px",
        margin: "0 auto",
      }}
    >
      <div>
        <h2>
          {player.name} <Formerly names={player.playerNameChange} />
        </h2>
      </div>
      <div style={{ marginBottom: 20 }}>
        <Link to="/">[← home]</Link>
        <Link
          title="Sort by item name"
          style={sort === "name" ? currentSort : undefined}
          to={`/player/${player.id}`}
        >
          [🔡]
        </Link>
        <Link
          title="Sort by collection rank"
          style={sort === "rank" ? currentSort : undefined}
          to={`/player/${player.id}?sort=rank`}
        >
          [🏅]
        </Link>
        <Link
          title="Sort by quantity of item"
          style={sort === "quantity" ? currentSort : undefined}
          to={`/player/${player.id}?sort=quantity`}
        >
          [🔢]
        </Link>
      </div>

      <PlayerPageRanking collections={player.collection} />
    </div>
  );
}
