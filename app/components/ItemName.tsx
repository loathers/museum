import type { Item } from "@prisma/client";
import { itemToString } from "~/utils";

type Props = {
  item: Item;
  disambiguate?: boolean;
  plural?: boolean;
};

export default function ItemName({ item, disambiguate, plural }: Props) {
  return <>{itemToString(item, disambiguate, plural)}</>;
}
