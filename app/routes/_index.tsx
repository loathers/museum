import type { Player } from "@prisma/client";
import type { LinksFunction, MetaFunction } from "@remix-run/node";
import { defer } from "@remix-run/node";
import { Await, Link, useLoaderData, useNavigate } from "@remix-run/react";
import { Suspense, useCallback, useState } from "react";

import ItemSelect from "~/components/ItemSelect";
import { prisma } from "~/lib/prisma.server";
import { englishJoin, plural } from "~/utils";

async function getRandomCollection(
  retrying = false
): Promise<{ id: number; plural: string; players: Player[] } | null> {
  const count = await prisma.item.count();

  const [item] = await prisma.item.findMany({
    take: 1,
    skip: Math.floor(Math.random() * count),
    select: {
      name: true,
      plural: true,
      id: true,
    },
  });

  if (!item) return null;

  const players = await prisma.player.findMany({
    where: {
      collection: {
        some: {
          rank: 1,
          item: item,
        },
      },
    },
    orderBy: { id: "asc" },
  });

  // If we found an item with more than three players in first place, just roll again
  if (players.length > 3) {
    if (retrying) return null;
    return await getRandomCollection(true);
  }

  return {
    id: item.id,
    plural: plural(item),
    players,
  };
}

export async function loader() {
  return defer({
    collection: getRandomCollection(),
    // Though we're set up for deferring this, prisma currently can't be deferred
    // https://github.com/remix-run/remix/issues/5153
    items: (
      await prisma.item.findMany({
        select: { name: true, id: true, ambiguous: true },
        orderBy: [{ name: "asc" }, { id: "asc" }],
      })
    ).map((i) => ({ ...i, plural: null })),
  });
}

export const links: LinksFunction = () => {
  return [
    {
      rel: "icon",
      href: "/favicon.gif",
      type: "image/gif",
    },
  ];
};

export const meta: MetaFunction = () => {
  return {
    title: "Museum :: Welcome to the musuem",
  };
};

export default function Index() {
  const { collection, items } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const browseItem = useCallback(
    (item?: { id: number } | null) => {
      if (!item) return;
      setLoading(true);
      navigate(`/item/${item.id}`);
    },
    [navigate]
  );

  return (
    <div
      style={{
        fontFamily: "system-ui, sans-serif",
        lineHeight: "1.4",
        textAlign: "center",
      }}
    >
      <h1>Welcome to the Museum</h1>
      <div style={{ marginBottom: 20 }}>
        <Link to="/about">[❓ about]</Link>
      </div>
      <Suspense
        fallback={
          <ItemSelect label="Item list loading..." items={[]} loading={true} />
        }
      >
        <Await resolve={items}>
          {(data) => (
            <ItemSelect
              label="Check the leaderboard for an item:"
              items={data}
              loading={loading}
              onChange={browseItem}
            />
          )}
        </Await>
      </Suspense>
      <Suspense fallback={<p>Loading a random collection...</p>}>
        <Await resolve={collection}>
          {(data) =>
            data && data.players ? (
              <p>
                For example, you can see how{" "}
                <Link to={`/item/${data.id}`} prefetch="intent">
                  {englishJoin(
                    data.players.map((p) => (
                      <b key={p.id} title={`#${p.id}`}>
                        {p.name}
                      </b>
                    ))
                  )}{" "}
                  {data.players.length === 1 ? "has" : "jointly have"} the most{" "}
                  <b>{data.plural}</b>
                </Link>
                .
              </p>
            ) : (
              <div />
            )
          }
        </Await>
      </Suspense>
    </div>
  );
}
