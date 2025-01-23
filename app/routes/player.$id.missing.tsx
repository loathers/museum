import {
  type LoaderFunctionArgs,
  type MetaFunction,
  data,
  useLoaderData,
  Link as RRLink,
} from "react-router";
import {
  Group,
  Heading,
  IconButton,
  Link,
  List,
  Stack,
  Text,
} from "@chakra-ui/react";

import { db } from "~/db.server";
import Layout from "~/components/Layout";
import ButtonLink from "~/components/ButtonLink";
import ItemName from "~/components/ItemName";
import { HOLDER_ID } from "~/utils";
import type { Prisma } from "@prisma/client";
import {
  LuArrowDown10,
  LuArrowDownAZ,
  LuArrowLeft,
  LuCircleUser,
} from "react-icons/lu";

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
          <ButtonLink leftIcon={<LuArrowLeft />} to="/">
            home
          </ButtonLink>
          <ButtonLink
            leftIcon={<LuCircleUser />}
            to={`/player/${player.playerid}`}
          >
            back to player
          </ButtonLink>
          <Group attached>
            <IconButton
              as={RRLink}
              aria-label="Sort by item name"
              title="Sort by item name"
              variant={sort === "name" ? "surface" : "outline"}
            >
              <RRLink to={`/player/${player.playerid}/missing`}>
                <LuArrowDownAZ />
              </RRLink>
            </IconButton>
            <IconButton
              as={RRLink}
              aria-label="Sort by item id"
              title="Sort by item id"
              variant={sort === "itemid" ? "surface" : "outline"}
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

      <List.Root>
        {missing.map((item) => (
          <List.Item key={item.itemid}>
            <Link asChild>
              <RRLink to={`/item/${item.itemid}`}>
                <ItemName item={item} disambiguate />
              </RRLink>
            </Link>
          </List.Item>
        ))}
      </List.Root>
    </Layout>
  );
}
