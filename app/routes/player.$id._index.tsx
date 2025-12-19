import {
  Button,
  Group,
  Heading,
  IconButton,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";
import type { Prisma } from "@prisma/client";
import {
  LuArrowDown10,
  LuArrowDownAZ,
  LuArrowDownWideNarrow,
  LuArrowLeft,
  LuMedal,
} from "react-icons/lu";
import {
  type LoaderFunctionArgs,
  type MetaFunction,
  Link as RRLink,
  data,
  redirect,
  useLoaderData,
} from "react-router";

import CustomTitle from "~/components/CustomTitle";
import Formerly from "~/components/Formerly";
import Layout from "~/components/Layout";
import PlayerPageRanking from "~/components/PlayerPageRanking";
import { db } from "~/db.server";

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
  const { id } = params;

  if (id && isNaN(parseInt(id))) {
    const found = await db.player.findFirst({
      where: { name: { mode: "insensitive", equals: id } },
    });

    if (found) throw redirect(`/player/${found.playerid}`);
    throw data({ message: "Invalid player name" }, { status: 400 });
  }

  if (!id) throw data({ message: "Invalid player ID" }, { status: 400 });

  const playerid = parseInt(id);

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
        <CustomTitle player={player} />
        <Group justifyContent="center">
          <Button asChild>
            <RRLink to="/">
              <LuArrowLeft />
              home
            </RRLink>
          </Button>
          <Group attached>
            <IconButton
              asChild
              aria-label="Sort by item name"
              title="Sort by item name"
              variant={sort === "name" ? "solid" : "outline"}
            >
              <RRLink to={`/player/${player.playerid}`}>
                <LuArrowDownAZ />
              </RRLink>
            </IconButton>
            <IconButton
              asChild
              aria-label="Sort by collection rank"
              title="Sort by collection rank"
              variant={sort === "rank" ? "solid" : "outline"}
            >
              <RRLink to={`/player/${player.playerid}?sort=rank`}>
                <LuMedal />
              </RRLink>
            </IconButton>
            <IconButton
              asChild
              aria-label="Sort by quantity of item"
              title="Sort by quantity of item"
              variant={sort === "quantity" ? "solid" : "outline"}
            >
              <RRLink to={`/player/${player.playerid}?sort=quantity`}>
                <LuArrowDownWideNarrow />
              </RRLink>
            </IconButton>
            <IconButton
              aria-label="Sort by item id"
              title="Sort by item id"
              variant={sort === "itemid" ? "solid" : "outline"}
              asChild
            >
              <RRLink to={`/player/${player.playerid}?sort=itemid`}>
                <LuArrowDown10 />
              </RRLink>
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
        <RRLink to={`/player/${player.playerid}/missing`}>
          what items are this player missing?
        </RRLink>
      </Link>
    </Layout>
  );
}
