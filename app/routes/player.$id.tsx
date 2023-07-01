import type { LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link as RemixLink, useLoaderData } from "@remix-run/react";
import { Container, Heading, HStack, Link, Stack } from "@chakra-ui/react";

import { prisma } from "~/lib/prisma.server";
import PlayerPageRanking from "~/components/PlayerPageRanking";
import Formerly from "~/components/Formerly";

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
      playerNameChange: {
        orderBy: { when: "desc" },
      },
    },
  });

  if (!player) throw json("Player not found with that id", { status: 404 });

  return { player, sort };
}

export const meta: V2_MetaFunction<typeof loader> = ({ data }) => [
  { title: `Museum :: ${data?.player.name}` }
];

const currentSort: React.CSSProperties = {
  textDecoration: "none",
  color: "inherit",
  pointerEvents: "none",
  fontWeight: "bold",
};

export default function Player() {
  const { player, sort } = useLoaderData<typeof loader>();

  return (
    <Container>
      <Stack alignItems="center">
        <Heading>
          {player.name} <Formerly names={player.playerNameChange} />
        </Heading>
        <HStack>
          <Link as={RemixLink} to="/">
            [← home]
          </Link>
          <Link
            as={RemixLink}
            title="Sort by item name"
            style={sort === "name" ? currentSort : undefined}
            to={`/player/${player.id}`}
          >
            [🔡]
          </Link>
          <Link
            as={RemixLink}
            title="Sort by collection rank"
            style={sort === "rank" ? currentSort : undefined}
            to={`/player/${player.id}?sort=rank`}
          >
            [🏅]
          </Link>
          <Link
            as={RemixLink}
            title="Sort by quantity of item"
            style={sort === "quantity" ? currentSort : undefined}
            to={`/player/${player.id}?sort=quantity`}
          >
            [🔢]
          </Link>
        </HStack>

        <PlayerPageRanking collections={player.collection} />
      </Stack>
    </Container>
  );
}
