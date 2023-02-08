type Props = {
  rank: number;
  quantity: number;
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

const getRankSymbol = (rank: number) => {
  switch (rank) {
    case 1:
      return "🥇";
    case 2:
      return "🥈";
    case 3:
      return "🥉";
    default:
      return `#${rank}`;
  }
};

const numberSuffix = (number: number) => {
  if (number > 3 && number < 21) return "th";
  switch (number % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
};

const outline = {
  textShadow:
    "-2px -2px 0 white, 2px -2px 0 white, -2px 2px white, 2px 2px white",
};

export default function Rank({ rank, joint, quantity, children }: Props) {
  const cellStyle = {
    backgroundColor: bg(rank),
    padding: rank > 3 ? undefined : 10,
  };

  return (
    <div style={{ display: "contents" }}>
      <div
        style={{ ...cellStyle, ...outline }}
        title={`${joint ? "Joint " : ""}${rank}${numberSuffix(rank)} place`}
      >
        {getRankSymbol(rank)}
      </div>
      <div style={cellStyle}>{children}</div>
      <div style={cellStyle}>({quantity.toLocaleString()})</div>
    </div>
  );
}
