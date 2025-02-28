import {
  Button,
  Group,
  Heading,
  Image,
  Spinner,
  Stack,
} from "@chakra-ui/react";
import { Suspense, useCallback, useState } from "react";
import { LuInfo, LuSearch } from "react-icons/lu";
import {
  Await,
  type LinksFunction,
  type MetaFunction,
  Link as RRLink,
  useLoaderData,
  useNavigate,
} from "react-router";

import { ColourModeToggle } from "~/components/ColourModeToggle";
import ItemSelect from "~/components/ItemSelect";
import Layout from "~/components/Layout";
import RandomCollection from "~/components/RandomCollection";
import { db } from "~/db.server";

export const loader = async () => {
  return {
    collections: await db.dailyCollection.findMany({}),
  };
};

export const links: LinksFunction = () => [
  {
    rel: "icon",
    href: "/favicon.gif",
    type: "image/gif",
  },
];

export const meta: MetaFunction = () => [
  { title: "Museum :: Welcome to the musuem" },
];

export default function Index() {
  const { collections } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const browseItem = useCallback(
    (item?: { itemid: number } | null) => {
      if (!item) return;
      setLoading(true);
      navigate(`/item/${item.itemid}`);
    },
    [navigate],
  );

  return (
    <Layout>
      <Stack>
        <Heading as="h1" size="4xl">
          Welcome to the Museum
        </Heading>
        <Group justifyContent="center">
          <Button asChild>
            <RRLink to="/about">
              <LuInfo />
              about
            </RRLink>
          </Button>
          <Button asChild>
            <RRLink to="/player">
              <LuSearch />
              player search
            </RRLink>
          </Button>
          <ColourModeToggle />
        </Group>
      </Stack>
      <Image
        src="/museum.webp"
        alt="The museum that can be found in KoL"
        margin={8}
        filter={{ _dark: "invert(1)" }}
      />
      <ItemSelect
        label="Check the leaderboard for an item"
        loading={loading}
        onChange={browseItem}
      />
      <Suspense fallback={<Spinner />}>
        <Await resolve={collections}>
          {(data) => <RandomCollection collections={data} />}
        </Await>
      </Suspense>
    </Layout>
  );
}
