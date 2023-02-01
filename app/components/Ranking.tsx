import Rank from "./Rank";

export type Collection = {
  quantity: number;
  rank: number;
  player: {
    id: number;
    name: string;
  };
};

type Props = {
  collections: Collection[];
};

const container: React.CSSProperties = {
  display: "grid",
  gap: "20px 20px",
  gridTemplateColumns: "repeat(1, 1fr)",
};

function rankStyle(rank: number): React.CSSProperties {
  switch (rank) {
    case 1:
      return {
        background: "#fad25a",
        padding: 10,
      };
    case 2:
      return {
        background: "#cbcace",
        padding: 10,
      };
    case 3:
      return {
        background: "#cea972",
        padding: 10,
      };
    default:
      return {};
  }
}

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

export default function Ranking({ collections }: Props) {
  const grouped = groupToMap(collections, (c) => c.rank);
  const keys = [...grouped.keys()].sort((a, b) => a - b);

  return (
    <div style={container}>
      {keys
        .map((k) => grouped.get(k)!)
        .map((c) => (
          <div key={c[0].rank} style={rankStyle(c[0].rank)}>
            <Rank collection={c} />
          </div>
        ))}
    </div>
  );
}
