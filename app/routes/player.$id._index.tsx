import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link as RemixLink, useLoaderData } from "@remix-run/react";
import {
  ButtonGroup,
  Heading,
  IconButton,
  Link,
  Stack,
} from "@chakra-ui/react";

import { prisma } from "~/lib/prisma.server";
import PlayerPageRanking from "~/components/PlayerPageRanking";
import Formerly from "~/components/Formerly";
import Layout from "~/components/Layout";
import ButtonLink from "~/components/ButtonLink";
import type { Prisma } from "@prisma/client";

const normalizeSort = (sort: string | null) => {
  switch (sort) {
    case "rank":
    case "quantity":
    case "itemid":
      return sort;
    default:
      return "name";
  }
};

const sortToOrderByQuery = (
  sort: ReturnType<typeof normalizeSort>,
): Prisma.CollectionOrderByWithRelationInput => {
  switch (sort) {
    case "rank":
      return { rank: "asc" };
    case "quantity":
      return { quantity: "desc" };
    case "itemid":
      return { item: { itemid: "desc" } };
    default:
      return { item: { name: "asc" } };
  }
};

export async function loader({ params, request }: LoaderFunctionArgs) {
  const playerid = Number(params.id);

  if (!playerid) throw json("A player id must be specified", { status: 400 });
  if (playerid >= 2 ** 31)
    throw json("Player not found with that id", { status: 404 });

  const url = new URL(request.url);
  const sort = normalizeSort(url.searchParams.get("sort"));

  const orderBy = sortToOrderByQuery(sort);

  const player = await prisma.player.findUnique({
    where: { playerid },
    select: {
      playerid: true,
      name: true,
      collections: {
        select: {
          quantity: true,
          rank: true,
          item: true,
        },
        orderBy: [orderBy, { item: { itemid: "asc" } }],
      },
      nameChanges: {
        orderBy: { when: "desc" },
      },
    },
  });

  if (!player) throw json("Player not found with that id", { status: 404 });

  return { player, sort };
}

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  { title: `Museum :: ${data?.player.name}` },
];

export default function Player() {
  const { player, sort } = useLoaderData<typeof loader>();

  return (
    <Layout>
      <Stack>
        <Heading textAlign="center">
          {player.name} <Formerly names={player.nameChanges} />
        </Heading>
        <ButtonGroup justifyContent="center">
          <ButtonLink leftIcon={<>←</>} to="/">
            home
          </ButtonLink>
          <ButtonGroup isAttached>
            <IconButton
              as={RemixLink}
              aria-label="Sort by item name"
              title="Sort by item name"
              variant={sort === "name" ? "solid" : "outline"}
              to={`/player/${player.playerid}`}
              icon={<>🔡</>}
            />
            <IconButton
              as={RemixLink}
              aria-label="Sort by collection rank"
              title="Sort by collection rank"
              variant={sort === "rank" ? "solid" : "outline"}
              to={`/player/${player.playerid}?sort=rank`}
              icon={<>🏅</>}
            />
            <IconButton
              as={RemixLink}
              aria-label="Sort by quantity of item"
              title="Sort by quantity of item"
              variant={sort === "quantity" ? "solid" : "outline"}
              to={`/player/${player.playerid}?sort=quantity`}
              icon={<>🔢</>}
            />
            <IconButton
              as={RemixLink}
              aria-label="Sort by item id"
              title="Sort by item id"
              variant={sort === "itemid" ? "solid" : "outline"}
              to={`/player/${player.playerid}?sort=itemid`}
              icon={<>🏷️</>}
            />
          </ButtonGroup>
        </ButtonGroup>
      </Stack>

      <PlayerPageRanking collections={player.collections} />

      <Link as={RemixLink} to={`/player/${player.playerid}/missing`}>
        what items are this player missing?
      </Link>
    </Layout>
  );
}
