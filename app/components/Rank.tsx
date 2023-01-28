import { Collection } from "./Ranking";

type Props = {
  rank: number;
  collection: Collection;
};

function getRankSymbol(rank: number) {
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
}

export default function Rank({ collection, rank }: Props) {
  return (
    <div key={collection.player.id}>
      {getRankSymbol(rank)} {collection.player.name} (
      {collection.quantity.toLocaleString()})
    </div>
  );
}
