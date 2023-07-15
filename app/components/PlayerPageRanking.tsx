import { Table, Tbody, Th, Thead, Tr } from "@chakra-ui/react";
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

export default function ItemPageRanking({ collections }: Props) {
  return (
    <Table>
      <Thead>
        <Tr>
          <Th>Collection Rank</Th>
          <Th>Item</Th>
          <Th>Quantity</Th>
        </Tr>
      </Thead>
      <Tbody>
        {collections.map(({ item, rank, quantity }) => (
          <Rank key={item.id} rank={rank} quantity={quantity} joint={false}>
            <Link to={`/item/${item.id}`}>
              <ItemName item={item} disambiguate />
            </Link>
          </Rank>
        ))}
      </Tbody>
    </Table>
  );
}
