import { prisma } from "~/lib/prisma.server";
import type { LoaderArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import ItemName from "~/components/ItemName";

const sortToOrderByQuery = (sort: string | null) => {
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
  const sort = url.searchParams.get("sort");

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
    },
  });

  if (!player) throw json("Player not found with that id", { status: 404 });

  return player;
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return {
    title: `Museum :: ${data.name}`,
  };
};

export default function Player() {
  const data = useLoaderData<typeof loader>();

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
        <h2>{data.name}</h2>
      </div>
      <div style={{ marginBottom: 20 }}>
        <Link to="/">[← back]</Link>
        <Link to={`/player/${data.id}`}>[a-z]</Link>
        <Link to={`/player/${data.id}?sort=rank`}>[🏅]</Link>
        <Link to={`/player/${data.id}?sort=quantity`}>[🔢]</Link>
      </div>

      <ul>
        {data.collection.map((c) => (
          <li key={c.item.id}>
            <Link to={`/item/${c.item.id}`}>
              <ItemName item={c.item} disambiguate />
            </Link>{" "}
            ({c.quantity}, #{c.rank} collector!)
          </li>
        ))}
      </ul>
    </div>
  );
}
