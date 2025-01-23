import { itemToString } from "~/utils";
import type { SlimItem } from "~/utils.server";

type Props = {
  item: SlimItem;
  disambiguate?: boolean;
  plural?: boolean;
};

export default function ItemName({
  item,
  disambiguate,
  plural = false,
}: Props) {
  return <>{itemToString(item, disambiguate, plural)}</>;
}
