import {
  Alert,
  Button,
  Group,
  Heading,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";
import { LuArrowLeft } from "react-icons/lu";
import { Link as RRLink, useLoaderData } from "react-router";

import Layout from "~/components/Layout";
import RankSymbol from "~/components/RankSymbol";
import { db } from "~/db.server";

export const loader = async () => {
  const { rank, quantity } = (await db.collection.findFirst({
    where: {
      playerid: 1197090,
      itemid: 641,
    },
  })) ?? { rank: 0, quantity: 0 };

  if (rank <= 1) return { gausieRank: rank, gausieNeeded: 0 };

  const next = await db.collection.findFirst({
    where: {
      itemid: 641,
      rank: rank - 1,
    },
  });

  return {
    gausieRank: rank,
    gausieNeeded: (next?.quantity ?? 0) - quantity,
  };
};

export default function About() {
  const { gausieRank, gausieNeeded } = useLoaderData<typeof loader>();
  return (
    <Layout alignment="stretch">
      <Stack>
        <Heading as="h2" size="4xl">
          About
        </Heading>
        <Group justifyContent="center">
          <Button asChild>
            <RRLink to="/">
              <LuArrowLeft />
              home
            </RRLink>
          </Button>
        </Group>
      </Stack>
      <Alert.Root status="info" variant="subtle">
        <Alert.Description>
          <b>Museum</b> is made by{" "}
          <Link asChild>
            <RRLink to="/player/1197090">gausie</RRLink>
          </Link>{" "}
          from a closed data feed provided by TPTB. He collects{" "}
          <Link asChild>
            <RRLink to="/item/641">toast</RRLink>
          </Link>{" "}
          and is currently ranked <RankSymbol rank={gausieRank} />
          {gausieRank === 1
            ? "! Thanks for your generous help!"
            : `. He would be very grateful if you could help him on his quest to find the ${gausieNeeded.toLocaleString()} more required to move up the leaderboard.`}
        </Alert.Description>
      </Alert.Root>
      <Text>
        This site is supported by financial contributors to the{" "}
        <Link
          target="_blank"
          rel="noopener noreferrer"
          href="https://opencollective.com/loathers"
        >
          Loathers community via Open Collective
        </Link>
        , a tool for transparent handling of funds within open source
        organisations.
      </Text>
      <Text>
        It was formerly hosted by{" "}
        <Link asChild>
          <RRLink to="/player/2485157">Joe the Sauceror</RRLink>
        </Link>
        , whom we would like to continue to thank.
      </Text>
      <Text>
        It is inspired by the (currently much more powerful) service provided by
        the{" "}
        <Link
          target="_blank"
          rel="noopener noreferrer"
          href="http://dcdb.coldfront.net"
        >
          Display Case Database
        </Link>{" "}
        hosted by Coldfront for many years.
      </Text>
      <Text>
        The source for the website itself is hosted on{" "}
        <Link
          target="_blank"
          rel="noopener noreferrer"
          href="https://github.com/loathers/museum"
        >
          GitHub
        </Link>
        .
      </Text>
    </Layout>
  );
}
