import {
  data,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";
import { Link as RemixLink, useLoaderData } from "@remix-run/react";
import {
  Group,
  Heading,
  IconButton,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";

import { db } from "~/db.server";
import PlayerPageRanking from "~/components/PlayerPageRanking";
import Formerly from "~/components/Formerly";
import Layout from "~/components/Layout";
import ButtonLink from "~/components/ButtonLink";
import type { Prisma } from "@prisma/client";
import {
  LuArrowDown10,
  LuArrowDownAZ,
  LuArrowDownWideNarrow,
  LuArrowLeft,
  LuMedal,
} from "react-icons/lu";

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

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const playerid = Number(params.id);

  if (!playerid) throw data("A player id must be specified", { status: 400 });
  if (playerid >= 2 ** 31)
    throw data("Player not found with that id", { status: 404 });

  const url = new URL(request.url);
  const sort = normalizeSort(url.searchParams.get("sort"));

  const orderBy = sortToOrderByQuery(sort);

  const player = await db.player.findUnique({
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

  if (!player) throw data("Player not found with that id", { status: 404 });

  const totalItems = player.collections
    .map((c) => c.quantity)
    .reduce((a, b) => a + b, 0);

  return { player, sort, totalItems };
};

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  { title: `Museum :: ${data?.player.name}` },
];

export default function Player() {
  const { player, sort, totalItems } = useLoaderData<typeof loader>();

  return (
    <Layout>
      <Stack>
        <Heading as="h2" size="4xl" textAlign="center">
          {player.name} <Formerly names={player.nameChanges} />
        </Heading>
        <Group justifyContent="center">
          <ButtonLink leftIcon={<LuArrowLeft />} to="/">
            home
          </ButtonLink>
          <Group attached>
            <IconButton
              asChild
              aria-label="Sort by item name"
              title="Sort by item name"
              variant={sort === "name" ? "surface" : "outline"}
            >
              <RemixLink to={`/player/${player.playerid}`}>
                <LuArrowDownAZ />
              </RemixLink>
            </IconButton>
            <IconButton
              asChild
              aria-label="Sort by collection rank"
              title="Sort by collection rank"
              variant={sort === "rank" ? "surface" : "outline"}
            >
              <RemixLink to={`/player/${player.playerid}?sort=rank`}>
                <LuMedal />
              </RemixLink>
            </IconButton>
            <IconButton
              asChild
              aria-label="Sort by quantity of item"
              title="Sort by quantity of item"
              variant={sort === "quantity" ? "surface" : "outline"}
            >
              <RemixLink to={`/player/${player.playerid}?sort=quantity`}>
                <LuArrowDownWideNarrow />
              </RemixLink>
            </IconButton>
            <IconButton
              aria-label="Sort by item id"
              title="Sort by item id"
              variant={sort === "itemid" ? "surface" : "outline"}
              asChild
            >
              <RemixLink to={`/player/${player.playerid}?sort=itemid`}>
                <LuArrowDown10 />
              </RemixLink>
            </IconButton>
          </Group>
        </Group>
      </Stack>

      <PlayerPageRanking collections={player.collections} />

      <Text>
        Wow, that's{" "}
        {totalItems === 1 ? "1 item" : `${totalItems.toLocaleString()} items`}{" "}
        total!
      </Text>

      <Link asChild>
        <RemixLink to={`/player/${player.playerid}/missing`}>
          what items are this player missing?
        </RemixLink>
      </Link>
    </Layout>
  );
}
