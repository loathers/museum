import RankSymbol from "./RankSymbol";

type Props = {
  rank: number;
  quantity: number;
  difference?: number | null;
  joint: boolean;
  children: React.ReactNode;
};

function bg(rank: number): React.CSSProperties["backgroundColor"] {
  switch (rank) {
    case 1:
      return "#fad25a";
    case 2:
      return "#cbcace";
    case 3:
      return "#cea972";
    default:
      return "transparent";
  }
}

export default function Rank({
  rank,
  joint,
  quantity,
  children,
  difference,
}: Props) {
  const cellStyle = {
    backgroundColor: bg(rank),
    padding: rank > 3 ? undefined : 10,
  };

  return (
    <div style={{ display: "contents" }}>
      <div style={cellStyle}>
        <RankSymbol rank={rank} joint={joint} />
      </div>
      <div style={cellStyle}>{children}</div>
      <div style={cellStyle}>{quantity.toLocaleString()}</div>
      {difference && (
        <div
          style={{
            gridColumn: "3/4",
            fontSize: 10,
            padding: 10,
            filter: "grayscale(1) opacity(0.5)",
          }}
        >
          <span
            title={`${difference.toLocaleString()} (+${(
              (difference / (quantity - difference)) *
              100
            ).toPrecision(3)}%)`}
            style={{ cursor: "help" }}
          >
            ↕️
          </span>
        </div>
      )}
    </div>
  );
}
