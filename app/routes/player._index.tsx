import { Button, Group, Heading, Stack } from "@chakra-ui/react";
import { useCallback, useState } from "react";
import { LuArrowLeft } from "react-icons/lu";
import { type MetaFunction, Link as RRLink, useNavigate } from "react-router";

import Layout from "~/components/Layout";
import PlayerSelect from "~/components/PlayerSelect";

export const meta: MetaFunction = () => [{ title: `Museum :: Players` }];

export default function PlayerRoot() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const browsePlayer = useCallback(
    (player: { playerid: number } | null) => {
      if (!player) return;
      setLoading(true);
      navigate(`/player/${player.playerid}`);
    },
    [navigate],
  );

  return (
    <Layout>
      <Stack>
        <Heading as="h2" size="4xl">
          Players
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
      <PlayerSelect
        label="Check a player's collection"
        loading={loading}
        onChange={browsePlayer}
      />
    </Layout>
  );
}
