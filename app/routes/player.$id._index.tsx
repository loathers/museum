import {
  Button,
  Group,
  Heading,
  IconButton,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";
import { sql } from "kysely";
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

type SortType = "rank" | "quantity" | "itemid" | "name";

const normalizeSort = (sort: string | null): SortType => {
  switch (sort) {
    case "rank":
    case "quantity":
    case "itemid":
      return sort;
    default:
      return "name";
  }
};

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const { id } = params;

  if (id && isNaN(parseInt(id))) {
    const found = await db
      .selectFrom("Player")
      .select("playerid")
      .where(sql`lower("name")`, "=", id.toLowerCase())
      .executeTakeFirst();

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

  // Query 1: Get player basic info
  const player = await db
    .selectFrom("Player")
    .select(["playerid", "name"])
    .where("playerid", "=", playerid)
    .executeTakeFirst();

  if (!player) throw data("Player not found with that id", { status: 404 });

  // Query 2: Get collections with items
  let collectionsQuery = db
    .selectFrom("Collection")
    .innerJoin("Item", "Item.itemid", "Collection.itemid")
    .select([
      "Collection.quantity",
      "Collection.rank",
      "Item.itemid",
      "Item.name",
      "Item.picture",
      "Item.ambiguous",
    ])
    .where("Collection.playerid", "=", playerid);

  // Apply sorting
  switch (sort) {
    case "rank":
      collectionsQuery = collectionsQuery
        .orderBy("Collection.rank", "asc")
        .orderBy("Item.itemid", "asc");
      break;
    case "quantity":
      collectionsQuery = collectionsQuery
        .orderBy("Collection.quantity", "desc")
        .orderBy("Item.itemid", "asc");
      break;
    case "itemid":
      collectionsQuery = collectionsQuery
        .orderBy("Item.itemid", "desc")
        .orderBy("Item.itemid", "asc");
      break;
    default: // name
      collectionsQuery = collectionsQuery
        .orderBy("Item.name", "asc")
        .orderBy("Item.itemid", "asc");
  }

  const collectionsRaw = await collectionsQuery.execute();

  // Query 3: Get name changes
  const nameChanges = await db
    .selectFrom("PlayerNameChange")
    .select(["oldname", "when"])
    .where("playerid", "=", playerid)
    .orderBy("when", "desc")
    .execute();

  // Transform collections to expected format
  const collections = collectionsRaw.map((c) => ({
    quantity: c.quantity,
    rank: c.rank,
    item: {
      itemid: c.itemid,
      name: c.name,
      picture: c.picture,
      ambiguous: c.ambiguous,
    },
  }));

  const totalItems = collections.reduce((sum, c) => sum + c.quantity, 0);

  return {
    player: { ...player, collections, nameChanges },
    sort,
    totalItems,
  };
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
