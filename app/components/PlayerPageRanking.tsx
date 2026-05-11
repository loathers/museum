import { Link, Table } from "@chakra-ui/react";
import { Link as RRLink } from "react-router";

import type { Item } from "~/db.types";
import ItemName from "./ItemName";
import Rank from "./Rank";

export type Collection = {
  quantity: number;
  rank: number;
  item: Pick<Item, "itemid" | "name" | "picture" | "ambiguous">;
};

type Props = {
  collections: Collection[];
};

export default function ItemPageRanking({ collections }: Props) {
  return (
    <Table.ScrollArea whiteSpace="normal">
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Rank</Table.ColumnHeader>
            <Table.ColumnHeader>Item</Table.ColumnHeader>
            <Table.ColumnHeader textAlign="end">Quantity</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {collections.map(({ item, rank, quantity }) => (
            <Rank
              key={item.itemid}
              rank={rank}
              quantity={quantity}
              joint={false}
            >
              <Link asChild>
                <RRLink to={`/item/${item.itemid}`}>
                  <ItemName item={item} disambiguate />
                </RRLink>
              </Link>
            </Rank>
          ))}
        </Table.Body>
      </Table.Root>
    </Table.ScrollArea>
  );
}
