import { Alert, Container, Heading, HStack, Link, Stack, Text } from "@chakra-ui/react";
import { json } from "@remix-run/node";
import { Link as RemixLink, useLoaderData } from "@remix-run/react";
import RankSymbol from "~/components/RankSymbol";
import { prisma } from "~/lib/prisma.server";

export const loader = async () => {
  const { rank, quantity } = (await prisma.collection.findUnique({
    where: {
      playerId_itemId: {
        playerId: 1197090,
        itemId: 641,
      },
    },
  })) ?? { rank: 0, quantity: 0 };

  if (rank <= 1) return json({ gausieRank: rank, gausieNeeded: 0 });

  const next = await prisma.collection.findFirst({
    where: {
      itemId: 641,
      rank: rank - 1,
    },
  });

  return json({
    gausieRank: rank,
    gausieNeeded: (next?.quantity ?? 0) - quantity,
  });
};

export default function About() {
  const { gausieRank, gausieNeeded } = useLoaderData<typeof loader>();
  return (
    <Container>
      <Stack alignItems="center">
        <Heading>About</Heading>
        <HStack>
          <Link as={RemixLink} to="/">
            [← home]
          </Link>
        </HStack>
        <Alert status="info" variant="subtle">
          <Text>
            <b>Museum</b> is made by{" "}
            <Link as={RemixLink} to="/player/1197090">
              gausie
            </Link>{" "}
            from a closed data feed provided by TPTB. He collects{" "}
            <Link as={RemixLink} to="/item/641">
              toast
            </Link>{" "}
            and is currently ranked <RankSymbol rank={gausieRank} />
            {gausieRank === 1
              ? "! Thanks for your generous help!"
              : `. He would be very grateful if you could help him on his quest to find the ${gausieNeeded.toLocaleString()} more required to move up the leaderboard.`}
          </Text>
        </Alert>
        <Text>
          The site is generously hosted by{" "}
          <Link as={RemixLink} to="/player/2485157">
            Joe the Sauceror
          </Link>
          .
        </Text>
        <Text>
          It is inspired by the (currently much more powerful) service provided
          by the <a href="http://dcdb.coldfront.net">Display Case Database</a>{" "}
          hosted by Coldfront for many years.
        </Text>
        <Text>
          The source for the website itself is hosted on{" "}
          <a href="https://github.com/loathers/museum">GitHub</a>.
        </Text>
      </Stack>
    </Container>
  );
}
