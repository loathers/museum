import type { Item } from "@prisma/client";
import { decodeHTML } from "entities";

type Props = {
  item: Item;
  disambiguate?: boolean;
};

export const itemToString = (item: Item | null, disambiguate = false) =>
  item
    ? `${item.ambiguous && disambiguate ? `[${item.id}]` : ""}${decodeHTML(
        item.name
      )}`
    : "";

export default function ItemName({ item, disambiguate }: Props) {
  return <>{itemToString(item, disambiguate)}</>;
}
