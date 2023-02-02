import { Link, useLoaderData, useNavigate } from "@remix-run/react";
import ItemSelect from "~/components/ItemSelect";
import { prisma } from "~/lib/prisma.server";
import { englishJoin, plural } from "~/utils";

async function getCollection(itemCount: number) {
  const skip = Math.floor(Math.random() * itemCount);
  const [result] = await prisma.item.findMany({
    take: 1,
    skip,
    select: {
      name: true,
      plural: true,
      id: true,
      collection: {
        where: { rank: 1 },
        orderBy: { player: { id: "desc" } },
        include: { player: true },
      },
    },
  });

  if (!result?.collection.length) {
    return null;
  }

  const players = result.collection.map((c) => c.player);

  return {
    id: result.id,
    plural: plural(result),
    players,
  };
}

export async function loader() {
  const items = await prisma.item.findMany({
    orderBy: [{ name: "asc" }, { id: "asc" }],
  });

  return {
    collection: await getCollection(items.length),
    items,
  };
}

export default function Index() {
  const { collection, items } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return (
    <div
      style={{
        fontFamily: "system-ui, sans-serif",
        lineHeight: "1.4",
        textAlign: "center",
      }}
    >
      <h1>Welcome to the Museum</h1>
      <ItemSelect
        label="Check the leaderboard for an item:"
        items={items}
        onChange={(item) => item && navigate(`/item/${item.id}`)}
      />
      {collection && (
        <p>
          For example, you can see how{" "}
          <Link to={`/item/${collection.id}`} prefetch="intent">
            {englishJoin(
              collection.players.map((p) => (
                <b key={p.id} title={`#${p.id}`}>
                  {p.name}
                </b>
              ))
            )}{" "}
            {collection.players.length === 1 ? "has" : "jointly have"} the most{" "}
            <b>{collection.plural}</b>
          </Link>
          .
        </p>
      )}
    </div>
  );
}
