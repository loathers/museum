import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link as RemixLink } from "@remix-run/react";
import {
  ButtonGroup,
  Heading,
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

export async function loader({ params }: LoaderFunctionArgs) {
  const playerid = Number(params.id);

  if (!playerid) throw json("A player id must be specified", { status: 400 });
  if (playerid >= 2 ** 31)
    throw json("Player not found with that id", { status: 404 });

  const player = await prisma.player.findUnique({
    where: { playerid },
    select: {
      playerid: true,
      name: true,
    },
  });

  if (!player) throw json("Player not found with that id", { status: 404 });

  const missing = await prisma.item.findMany({
    where: {
      quest: playerid === HOLDER_ID ? undefined : false,
      missing: false,
      collections: { none: { playerid } },
    },
    select: { name: true, itemid: true, ambiguous: true },
    orderBy: { name: "asc" },
  });

  return { player, missing };
}

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  { title: `Museum :: ${data?.player.name} missing items` },
];

export default function Missing() {
  const { player, missing } = useLoaderData<typeof loader>();

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
        </ButtonGroup>
      </Stack>

      <Text>
        In their foolhardy quest to collect every item, this player comes{" "}
        {missing.length.toLocaleString()} short
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
