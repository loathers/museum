import type { Item } from "@prisma/client";
import { Link } from "@remix-run/react";

import ItemName from "./ItemName";
import Rank from "./Rank";

export type Collection = {
  quantity: number;
  rank: number;
  item: Item;
};

type Props = {
  collections: Collection[];
};

const container: React.CSSProperties = {
  display: "grid",
  rowGap: 20,
  gridTemplateColumns: "repeat(3, 1fr)",
};

export default function ItemPageRanking({ collections }: Props) {
  return (
    <div style={container}>
      <h4>Collection Rank</h4>
      <h4>Item</h4>
      <h4>Quantity</h4>
      {collections.map(({ item, rank, quantity }) => (
        <Rank key={item.id} rank={rank} quantity={quantity} joint={false}>
          <Link to={`/item/${item.id}`}>
            <ItemName item={item} plural={quantity !== 1} disambiguate />
          </Link>
        </Rank>
      ))}
    </div>
  );
}
