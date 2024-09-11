import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { unstable_data as data } from "@remix-run/node";
import { useLoaderData, Link as RemixLink } from "@remix-run/react";
import {
  ButtonGroup,
  Heading,
  IconButton,
  Link,
  List,
  ListItem,
  Stack,
  Text,
} from "@chakra-ui/react";

import { prisma } from "~/lib/prisma.server";
import Layout from "~/components/Layout";
import ButtonLink from "~/components/ButtonLink";
import ItemName from "~/components/ItemName";
import { HOLDER_ID } from "~/utils";
import type { Prisma } from "@prisma/client";

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

  const player = await prisma.player.findUnique({
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

  const missing = await prisma.item.findMany({
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
        <Heading textAlign="center">{player.name} missing items</Heading>
        <ButtonGroup justifyContent="center">
          <ButtonLink leftIcon={<>←</>} to="/">
            home
          </ButtonLink>
          <ButtonLink leftIcon={<>👤</>} to={`/player/${player.playerid}`}>
            back to player
          </ButtonLink>
          <ButtonGroup isAttached>
            <IconButton
              as={RemixLink}
              aria-label="Sort by item name"
              title="Sort by item name"
              variant={sort === "name" ? "solid" : "outline"}
              to={`/player/${player.playerid}/missing`}
              icon={<>🔡</>}
            />
            <IconButton
              as={RemixLink}
              aria-label="Sort by item id"
              title="Sort by item id"
              variant={sort === "itemid" ? "solid" : "outline"}
              to={`/player/${player.playerid}/missing?sort=itemid`}
              icon={<>🏷️</>}
            />
          </ButtonGroup>
        </ButtonGroup>
      </Stack>

      <Text>
        In their foolhardy quest to collect every item, this player comes{" "}
        {missing.length.toLocaleString()} short.
      </Text>

      <List>
        {missing.map((item) => (
          <ListItem key={item.itemid}>
            <Link as={RemixLink} to={`/item/${item.itemid}`}>
              <ItemName item={item} disambiguate />
            </Link>
          </ListItem>
        ))}
      </List>
    </Layout>
  );
}
