import type { MetaFunction } from "@remix-run/node";
import { useNavigate } from "@remix-run/react";
import { useCallback, useState } from "react";
import PlayerSelect from "~/components/PlayerSelect";
import { ButtonGroup, Heading, Stack } from "@chakra-ui/react";
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
        <ButtonGroup justifyContent="center">
          <ButtonLink leftIcon={<>←</>} to="/">
            home
          </ButtonLink>
        </ButtonGroup>
      </Stack>
      <PlayerSelect
        label="Check a player's collection"
        loading={loading}
        onChange={browsePlayer}
      />
    </Layout>
  );
}
