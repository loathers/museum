import type { Player } from "@prisma/client";
import { Link } from "@remix-run/react";
import { englishJoin } from "~/utils";
import CollectionInsights from "./CollectionInsights";
import Rank from "./Rank";

export type Collection = {
  quantity: number;
  rank: number;
  player: Player;
};

type Props = {
  collections: Collection[];
};

const container: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
};

function groupToMap<K, V>(
  array: V[],
  callbackFn: (element: V, index?: number, array?: V[]) => K
) {
  const map = new Map<K, V[]>();
  for (let i = 0; i < array.length; i++) {
    const key = callbackFn(array[i], i, array);
    if (!map.has(key)) map.set(key, [] as V[]);
    map.get(key)!.push(array[i]);
  }
  return map;
}

export default function ItemPageRanking({ collections }: Props) {
  const grouped = groupToMap(collections, (c) => c.rank);
  const keys = [...grouped.keys()].sort((a, b) => a - b);

  const table = collections.length > 0 && <>
    <h4>Rank</h4>
      <h4>Item</h4>
      <h4>Quantity</h4>

      {keys
        .map((k) => grouped.get(k)!)
        .map((c, i, a) => (
          <Rank
            key={c[0].rank}
            rank={c[0].rank}
            difference={
              a.length > i + 1 ? c[0].quantity - a[i + 1][0].quantity : null
            }
            quantity={c[0].quantity}
            joint={c.length > 1}
          >
            {englishJoin(
              c.map(({ player }) => (
                <Link
                  key={player.id}
                  title={`${player.name} #${player.id}`}
                  to={`/player/${player.id}`}
                >
                  {player.name}
                </Link>
              ))
            )}
          </Rank>
        ))}
        </>;

  return (
    <div style={container}>
      <CollectionInsights groups={grouped} />

      {table}
    </div>
  );
}
