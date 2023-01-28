type Props = {
  collections: {
    quantity: number;
    player: {
      id: number;
      name: string;
    };
  }[];
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
          🥇 {first.player.name} ({first.quantity.toLocaleString()})
        </div>
      )}
      {second && (
        <div style={{ gridArea: "second" }}>
          🥈 {second.player.name} ({second.quantity.toLocaleString()})
        </div>
      )}
      {third && (
        <div style={{ gridArea: "third" }}>
          🥉 {third.player.name} ({third.quantity.toLocaleString()})
        </div>
      )}
      {rest.length > 0 && (
        <>
          <div style={{ gridArea: "a" }}>
            {rest
              .filter((c, i) => i % 3 === 0)
              .map((c, i) => (
                <div key={c.player.id}>
                  #{i * 3 + 4} {c.player.name} ({c.quantity.toLocaleString()})
                </div>
              ))}
          </div>
          <div style={{ gridArea: "b" }}>
            {rest
              .filter((c, i) => i % 3 === 1)
              .map((c, i) => (
                <div key={c.player.id}>
                  #{i * 3 + 5} {c.player.name} ({c.quantity.toLocaleString()})
                </div>
              ))}
          </div>
          <div style={{ gridArea: "c" }}>
            {rest
              .filter((c, i) => i % 3 === 2)
              .map((c, i) => (
                <div key={c.player.id}>
                  #{i * 3 + 6} {c.player.name} ({c.quantity.toLocaleString()})
                </div>
              ))}
          </div>
        </>
      )}
    </div>
  );
}
