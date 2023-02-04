import { Link } from "@remix-run/react";
import { englishJoin } from "~/utils";
import type { Collection } from "./Ranking";

type Props = {
  collection: Collection[];
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

export default function Rank({ collection }: Props) {
  return (
    <div>
      {getRankSymbol(collection[0].rank)}{" "}
      {englishJoin(
        collection.map((c) => (
          <Link
            key={c.player.id}
            title={`${c.player.name} #${c.player.id}`}
            to={`/player/${c.player.id}`}
          >
            {c.player.name}
          </Link>
        ))
      )}{" "}
      ({collection[0].quantity.toLocaleString()})
    </div>
  );
}
