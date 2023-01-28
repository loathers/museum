import { Link, useLoaderData } from "@remix-run/react";
import { prisma } from "~/lib/prisma.server";
import { plural } from "~/utils";

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
        take: 1,
        orderBy: { quantity: "desc" },
        include: { player: true },
      },
    },
  });

  const player = result.collection[0].player;

  return {
    id: result.id,
    plural: plural(result),
    player,
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
        For now, visit <code>/items/&lt;your item id&gt;</code>.
      </p>
      <p>
        For example, you can see how{" "}
        <Link to={`/item/${collection.id}`} prefetch="intent">
          <b title={`#${collection.player.id}`}>{collection.player.name}</b> has
          the most <b>{collection.plural}</b>
        </Link>
        .
      </p>
    </div>
  );
}
