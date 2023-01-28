import Rank from "./Rank";

export type Collection = {
  quantity: number;
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
  gridTemplateColumns: "1fr 1fr 1fr",
  gridTemplateRows: "min-content min-content min-content 1fr",
  gap: "20px 0px",
  gridTemplateAreas: `"first first first" "second second second" "third third third" "a b c"`,
};

export default function Ranking({ collections }: Props) {
  const [first, second, third, ...rest] = collections;
  return (
    <div style={container}>
      {first && (
        <div style={{ gridArea: "first" }}>
          <Rank rank={1} collection={first} />
        </div>
      )}
      {second && (
        <div style={{ gridArea: "second" }}>
          <Rank rank={2} collection={second} />
        </div>
      )}
      {third && (
        <div style={{ gridArea: "third" }}>
          <Rank rank={3} collection={third} />
        </div>
      )}
      {rest.length > 0 && (
        <>
          <div style={{ gridArea: "a" }}>
            {rest
              .filter((_, i) => i % 3 === 0)
              .map((c, i) => (
                <Rank key={c.player.id} rank={i * 3 + 4} collection={c} />
              ))}
          </div>
          <div style={{ gridArea: "b" }}>
            {rest
              .filter((_, i) => i % 3 === 1)
              .map((c, i) => (
                <Rank key={c.player.id} rank={i * 3 + 5} collection={c} />
              ))}
          </div>
          <div style={{ gridArea: "c" }}>
            {rest
              .filter((_, i) => i % 3 === 2)
              .map((c, i) => (
                <Rank key={c.player.id} rank={i * 3 + 6} collection={c} />
              ))}
          </div>
        </>
      )}
    </div>
  );
}
