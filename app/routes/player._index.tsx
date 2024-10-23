import type { MetaFunction } from "@remix-run/node";
import { useNavigate } from "@remix-run/react";
import { useCallback, useState } from "react";
import PlayerSelect from "~/components/PlayerSelect";
import { Group, Heading, Stack } from "@chakra-ui/react";
import Layout from "~/components/Layout";
import ButtonLink from "~/components/ButtonLink";

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
        <Heading>Players</Heading>
        <Group justifyContent="center">
          <ButtonLink leftIcon={<>←</>} to="/">
            home
          </ButtonLink>
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
