import { ButtonGroup, Heading, Image, Spinner, Stack } from "@chakra-ui/react";
import type { LinksFunction, MetaFunction } from "@remix-run/node";
import { Await, useLoaderData, useNavigate } from "@remix-run/react";
import { Suspense, useCallback, useState } from "react";
import ButtonLink from "~/components/ButtonLink";

import ItemSelect from "~/components/ItemSelect";
import Layout from "~/components/Layout";
import RandomCollection from "~/components/RandomCollection";
import { prisma } from "~/lib/prisma.server";

export const loader = async () => {
  return {
    collections: await prisma.dailyCollection.findMany({}),
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
        <Heading as="h1">Welcome to the Museum</Heading>
        <ButtonGroup justifyContent="center">
          <ButtonLink leftIcon={<>❓</>} to="/about">
            about
          </ButtonLink>
          <ButtonLink leftIcon={<>🔎</>} to="/player">
            player search
          </ButtonLink>
        </ButtonGroup>
      </Stack>
      <Image
        src="/museum.webp"
        alt="The museum that can be found in KoL"
        margin={8}
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
