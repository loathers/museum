import {
  Box,
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
  LuArrowLeft,
  LuCircleUser,
} from "react-icons/lu";
import {
  type LoaderFunctionArgs,
  type MetaFunction,
  Link as RRLink,
  data,
  useLoaderData,
} from "react-router";
import { Fragment } from "react/jsx-runtime";

import ItemName from "~/components/ItemName";
import Layout from "~/components/Layout";
import { db } from "~/db.server";
import { HOLDER_ID } from "~/utils";

const normalizeSort = (sort: string | null) => {
  switch (sort) {
    case "itemid":
      return sort;
    default:
      return "name";
  }
};

const sortToOrderByQuery = (
  sort: ReturnType<typeof normalizeSort>,
): Prisma.ItemOrderByWithRelationInput => {
  switch (sort) {
    case "itemid":
      return { itemid: "desc" };
    default:
      return { name: "asc" };
  }
};

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const playerid = Number(params.id);

  if (!playerid) throw data("A player id must be specified", { status: 400 });
  if (playerid >= 2 ** 31)
    throw data("Player not found with that id", { status: 404 });

  const player = await db.player.findUnique({
    where: { playerid },
    select: {
      playerid: true,
      name: true,
    },
  });

  if (!player) throw data("Player not found with that id", { status: 404 });

  const url = new URL(request.url);
  const sort = normalizeSort(url.searchParams.get("sort"));
  const orderBy = sortToOrderByQuery(sort);

  const missing = await db.item.findMany({
    where: {
      quest: playerid === HOLDER_ID ? undefined : false,
      missing: false,
      collections: { none: { playerid } },
      seen: { isNot: null },
    },
    select: { name: true, itemid: true, ambiguous: true },
    orderBy,
  });

  return { player, missing, sort };
};

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  { title: `Museum :: ${data?.player.name} missing items` },
];

export default function Missing() {
  const { player, missing, sort } = useLoaderData<typeof loader>();

  return (
    <Layout>
      <Stack>
        <Heading as="h2" size="4xl" textAlign="center">
          {player.name} missing items
        </Heading>
        <Group justifyContent="center">
          <Button asChild>
            <RRLink to="/">
              <LuArrowLeft />
              home
            </RRLink>
          </Button>
          <Button asChild>
            <RRLink to={`/player/${player.playerid}`}>
              <LuCircleUser />
              back to player
            </RRLink>
          </Button>
          <Group attached>
            <IconButton
              asChild
              aria-label="Sort by item name"
              title="Sort by item name"
              variant={sort === "name" ? "solid" : "outline"}
            >
              <RRLink to={`/player/${player.playerid}/missing`}>
                <LuArrowDownAZ />
              </RRLink>
            </IconButton>
            <IconButton
              asChild
              aria-label="Sort by item id"
              title="Sort by item id"
              variant={sort === "itemid" ? "solid" : "outline"}
            >
              <RRLink to={`/player/${player.playerid}/missing?sort=itemid`}>
                <LuArrowDown10 />
              </RRLink>
            </IconButton>
          </Group>
        </Group>
      </Stack>

      <Text>
        In their foolhardy quest to collect every item, this player comes{" "}
        {missing.length.toLocaleString()} short.
      </Text>

      <Box>
        {missing.map((item, i) => (
          <Fragment key={item.itemid}>
            {i > 0 && ", "}
            <Link asChild>
              <RRLink to={`/item/${item.itemid}`}>
                <ItemName item={item} disambiguate />
              </RRLink>
            </Link>
          </Fragment>
        ))}
      </Box>
    </Layout>
  );
}
