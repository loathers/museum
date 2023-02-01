import { Link, useLoaderData } from "@remix-run/react";
import { prisma } from "~/lib/prisma.server";
import { englishJoin, plural } from "~/utils";

export async function loader() {
  const items = await prisma.item.count();
  const skip = Math.floor(Math.random() * items);
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

export default function Index() {
  const collection = useLoaderData<typeof loader>();

  return (
    <div
      style={{
        fontFamily: "system-ui, sans-serif",
        lineHeight: "1.4",
        textAlign: "center",
      }}
    >
      <h1>Welcome to the Museum</h1>
      <p>
        For now, visit <code>/item/&lt;your item id&gt;</code>.
      </p>
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
