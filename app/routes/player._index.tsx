import { defer } from "@remix-run/node";
import type { V2_MetaFunction } from "@remix-run/node";
import {
  Await,
  Link,
  useLoaderData,
  useNavigate
} from "@remix-run/react";
import { Suspense, useCallback, useState } from "react";
import PlayerSelect from "~/components/PlayerSelect";
import { prisma } from "~/lib/prisma.server";

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
    [navigate]
  );

  return (
    <div
      style={{
        fontFamily: "system-ui, sans-serif",
        lineHeight: "1.4",
        textAlign: "center",
      }}
    >
      <h1>Players</h1>
      <div style={{ marginBottom: 20 }}>
        <Link to="/">[← home]</Link>
      </div>
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
              label="Check a player's collection:"
              players={players}
              loading={loading}
              onChange={browsePlayer}
            />
          )}
        </Await>
      </Suspense>
    </div>
  );
}
