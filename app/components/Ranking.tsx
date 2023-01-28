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
      {[
        { data: first, gridArea: "first" },
        { data: second, gridArea: "second" },
        { data: third, gridArea: "third" },
      ].map(
        ({ data, gridArea }, i) =>
          data && (
            <div style={{ gridArea }} key={i + 1}>
              <Rank collection={data} rank={i + 1} />
            </div>
          )
      )}
      {rest.length > 0 &&
        ["a", "b", "c"].map((gridArea, index) => (
          <div style={{ gridArea }} key={index}>
            {rest
              .filter((_c, i) => i % 3 === index)
              .map((c, i) => (
                <Rank
                  key={c.player.id}
                  rank={i * 3 + 4 + index}
                  collection={c}
                />
              ))}
          </div>
        ))}
    </div>
  );
}
