import { Container, Heading, HStack, Image, Link, Stack } from "@chakra-ui/react";
import type { Player } from "@prisma/client";
import type { LinksFunction, V2_MetaFunction } from "@remix-run/node";
import { defer } from "@remix-run/node";
import { Await, Link as RemixLink, useLoaderData, useNavigate } from "@remix-run/react";
import { decodeHTML } from "entities";
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
    items: await prisma.item.findMany({
      where: { missing: false },
      select: { name: true, id: true, ambiguous: true, _count: { select: { collection: true } } },
      orderBy: [{ name: "asc" }, { id: "asc" }],
    }).then(items => items.filter(i => i._count.collection > 0)),
  });
}

export const links: LinksFunction = () => [
    {
      rel: "icon",
      href: "/favicon.gif",
      type: "image/gif",
    },
  ];

export const meta: V2_MetaFunction = () => [
  { title: "Museum :: Welcome to the musuem" }
];

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
    <Container>
      <Stack alignItems="center">
        <Heading as="h1">Welcome to the Museum</Heading>
        <HStack justifyContent="center">
          <Link as={RemixLink} to="/about">
            [❓ about]
          </Link>
          <Link as={RemixLink} to="/player">
            [🔎 player search]
          </Link>
        </HStack>
        <Image
          src="/museum.webp"
          alt="The museum that can be found in KoL"
          margin={8}
        />
        <Suspense
          fallback={
            <ItemSelect
              label="Item list loading..."
              items={[]}
              loading={true}
            />
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
                  <Link
                    as={RemixLink}
                    to={`/item/${data.id}`}
                    prefetch="intent"
                  >
                    {englishJoin(
                      data.players.map((p) => (
                        <b key={p.id} title={`#${p.id}`}>
                          {p.name}
                        </b>
                      ))
                    )}{" "}
                    {data.players.length === 1 ? "has" : "jointly have"} the
                    most{" "}
                    <b
                      dangerouslySetInnerHTML={{
                        __html: decodeHTML(data.plural),
                      }}
                    ></b>
                  </Link>
                  .
                </p>
              ) : (
                <div />
              )
            }
          </Await>
        </Suspense>
      </Stack>
    </Container>
  );
}
