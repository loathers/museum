import { useMemo } from "react";

type Props = {
  rank: number;
  joint?: boolean;
};

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

export default function RankSymbol({ rank, joint }: Props) {
  const style = useMemo(
    () => ({
      display: "inline",
      textShadow:
        rank <= 3
          ? "-2px -2px 0 white, 2px -2px 0 white, -2px 2px white, 2px 2px white"
          : undefined,
      cursor: "default",
    }),
    [rank],
  );

  return (
    <span
      style={style}
      title={`${joint ? "Joint " : ""}${rank}${numberSuffix(rank)} place`}
    >
      {getRankSymbol(rank)}
    </span>
  );
}
