import {
  Group,
  Heading,
  IconButton,
  Image,
  Spinner,
  Stack,
} from "@chakra-ui/react";
import type { LinksFunction, MetaFunction } from "@remix-run/node";
import { Await, useLoaderData, useNavigate } from "@remix-run/react";
import { useTheme } from "next-themes";
import { Suspense, useCallback, useState } from "react";
import { LuInfo, LuMoon, LuSearch, LuSun } from "react-icons/lu";
import ButtonLink from "~/components/ButtonLink";

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

function useColorMode() {
  const { resolvedTheme, setTheme } = useTheme();
  const toggleColorMode = () => {
    setTheme(resolvedTheme === "light" ? "dark" : "light");
  };
  return {
    colorMode: resolvedTheme,
    setColorMode: setTheme,
    toggleColorMode,
  };
}

export default function Index() {
  const { collections } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const { toggleColorMode, colorMode } = useColorMode();

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
          <ButtonLink leftIcon={<LuInfo />} to="/about">
            about
          </ButtonLink>
          <ButtonLink leftIcon={<LuSearch />} to="/player">
            player search
          </ButtonLink>
          <IconButton
            onClick={toggleColorMode}
            variant="subtle"
            title={
              colorMode === "light"
                ? "Switch to dark mode"
                : "Switch to light mode"
            }
          >
            {colorMode === "light" ? <LuSun /> : <LuMoon />}
          </IconButton>
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
