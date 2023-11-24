import {
  Link,
  Table,
  TableContainer,
  Tbody,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import type { Item } from "@prisma/client";
import { Link as RemixLink } from "@remix-run/react";

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
    <TableContainer whiteSpace="normal">
      <Table>
        <Thead>
          <Tr>
            <Th>Rank</Th>
            <Th>Item</Th>
            <Th isNumeric>Quantity</Th>
          </Tr>
        </Thead>
        <Tbody>
          {collections.map(({ item, rank, quantity }) => (
            <Rank
              key={item.itemid}
              rank={rank}
              quantity={quantity}
              joint={false}
            >
              <Link as={RemixLink} to={`/item/${item.itemid}`}>
                <ItemName item={item} disambiguate />
              </Link>
            </Rank>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
}
