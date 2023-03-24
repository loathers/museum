import { prisma } from "~/lib/prisma.server";
import type { LoaderArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import PlayerPageRanking from "~/components/PlayerPageRanking";
import type { ChangeEventHandler } from "react";
import { useState } from "react";

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
  const maxRank = Number(url.searchParams.get("maxrank") ?? "0");

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
        where: maxRank
          ? {
              rank: {
                gte: maxRank,
              },
            }
          : undefined,
      },
    },
  });

  if (!player) throw json("Player not found with that id", { status: 404 });

  return { player, sort, maxRank };
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
  const { player, sort, maxRank } = useLoaderData<typeof loader>();
  const [max, setMax] = useState(maxRank);
  const handleSetMax: ChangeEventHandler<HTMLInputElement> = (e) =>
    setMax(e.target.valueAsNumber);

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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h2>{player.name}</h2>
      </div>
      <div style={{ marginBottom: 20 }}>
        <Link to='/'>[← home]</Link>
        <Link
          title='Sort by item name'
          style={sort === "name" ? currentSort : undefined}
          to={`/player/${player.id}${max ? `?maxrank=${max}` : ""}`}
        >
          [🔡]
        </Link>
        <Link
          title='Sort by collection rank'
          style={sort === "rank" ? currentSort : undefined}
          to={`/player/${player.id}?${new URLSearchParams({
            sort: "rank",
            maxrank: max.toFixed(0),
          })}`}
        >
          [🏅]
        </Link>
        <Link
          title='Sort by quantity of item'
          style={sort === "quantity" ? currentSort : undefined}
          to={`/player/${player.id}?${new URLSearchParams({
            sort: "quantity",
            maxrank: max.toFixed(0),
          })}`}
        >
          [🔢]
        </Link>
        <input type='number' value={max} onChange={handleSetMax} />
        <Link
          title='Only see entries of a certain rank or better'
          to={`/player/${player.id}?${new URLSearchParams({
            sort,
            maxrank: max.toFixed(0),
          })}`}
        >
          [Filter]
        </Link>
      </div>

      <PlayerPageRanking collections={player.collection} />
    </div>
  );
}
