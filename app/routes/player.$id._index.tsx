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
  LuChevronLeft,
  LuChevronRight,
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

const PAGE_SIZE = 200;

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
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1") || 1);

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

  switch (sort) {
    case "rank":
      collectionsQuery = collectionsQuery
        .orderBy("Collection.rank", "asc")
        .orderBy("Item.name", "asc");
      break;
    case "quantity":
      collectionsQuery = collectionsQuery
        .orderBy("Collection.quantity", "desc")
        .orderBy("Item.name", "asc");
      break;
    case "itemid":
      collectionsQuery = collectionsQuery
        .orderBy("Item.itemid", "desc")
        .orderBy("Item.name", "asc");
      break;
    default:
      collectionsQuery = collectionsQuery
        .orderBy("Item.name", "asc")
        .orderBy("Item.itemid", "asc");
  }

  collectionsQuery = collectionsQuery
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE);

  const [player, collectionsRaw, nameChanges, totals] = await Promise.all([
    db
      .selectFrom("Player")
      .select(["playerid", "name"])
      .where("playerid", "=", playerid)
      .executeTakeFirst(),
    collectionsQuery.execute(),
    db
      .selectFrom("PlayerNameChange")
      .select(["oldname", "when"])
      .where("playerid", "=", playerid)
      .orderBy("when", "desc")
      .execute(),
    db
      .selectFrom("Collection")
      .select((eb) => [
        eb.fn.sum("quantity").as("totalItems"),
        eb.fn.countAll().as("distinctItems"),
      ])
      .where("playerid", "=", playerid)
      .executeTakeFirst(),
  ]);

  if (!player) throw data("Player not found with that id", { status: 404 });

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

  const totalItems = Number(totals?.totalItems ?? 0);
  const distinctItems = Number(totals?.distinctItems ?? 0);
  const totalPages = Math.max(1, Math.ceil(distinctItems / PAGE_SIZE));

  return {
    player: { ...player, collections, nameChanges },
    sort,
    page,
    totalPages,
    totalItems,
  };
};

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  { title: `Museum :: ${data?.player.name}` },
];

export default function Player() {
  const { player, sort, page, totalPages, totalItems } =
    useLoaderData<typeof loader>();

  const pageHref = (p: number) => {
    const params = new URLSearchParams();
    if (sort !== "name") params.set("sort", sort);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return `/player/${player.playerid}${qs ? `?${qs}` : ""}`;
  };

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

      {totalPages > 1 && (
        <Group justifyContent="center" attached>
          <IconButton
            aria-label="Previous page"
            title="Previous page"
            variant="outline"
            disabled={page <= 1}
            asChild={page > 1}
          >
            {page > 1 ? (
              <RRLink to={pageHref(page - 1)}>
                <LuChevronLeft />
              </RRLink>
            ) : (
              <LuChevronLeft />
            )}
          </IconButton>
          <Button variant="outline" disabled>
            Page {page} of {totalPages}
          </Button>
          <IconButton
            aria-label="Next page"
            title="Next page"
            variant="outline"
            disabled={page >= totalPages}
            asChild={page < totalPages}
          >
            {page < totalPages ? (
              <RRLink to={pageHref(page + 1)}>
                <LuChevronRight />
              </RRLink>
            ) : (
              <LuChevronRight />
            )}
          </IconButton>
        </Group>
      )}

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
