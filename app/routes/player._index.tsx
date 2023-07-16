import { defer } from "@remix-run/node";
import type { V2_MetaFunction } from "@remix-run/node";
import { Await, useLoaderData, useNavigate } from "@remix-run/react";
import { Suspense, useCallback, useState } from "react";
import PlayerSelect from "~/components/PlayerSelect";
import { prisma } from "~/lib/prisma.server";
import { ButtonGroup, Heading, Stack } from "@chakra-ui/react";
import Layout from "~/components/Layout";
import ButtonLink from "~/components/ButtonLink";

export async function loader() {
  return defer({
    players: await prisma.player.findMany({
      orderBy: { id: "asc" },
    }),
  });
}

export const meta: V2_MetaFunction<typeof loader> = () => [
  { title: `Museum :: Players` },
];

export default function PlayerRoot() {
  const data = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const browsePlayer = useCallback(
    (player?: { id: number } | null) => {
      if (!player) return;
      setLoading(true);
      navigate(`/player/${player.id}`);
    },
    [navigate],
  );

  return (
    <Layout>
      <Stack>
        <Heading>Players</Heading>
        <ButtonGroup justifyContent="center">
          <ButtonLink leftIcon={<>←</>} to="/">
            home
          </ButtonLink>
        </ButtonGroup>
      </Stack>
      <Suspense
        fallback={
          <PlayerSelect
            label="Player list loading..."
            players={[]}
            loading={true}
          />
        }
      >
        <Await resolve={data.players}>
          {(players) => (
            <PlayerSelect
              label="Check a player's collection"
              players={players}
              loading={loading}
              onChange={browsePlayer}
            />
          )}
        </Await>
      </Suspense>
    </Layout>
  );
}
