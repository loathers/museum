import type { SlimItem } from "~/utils";
import { itemToString } from "~/utils";

import ItemName from "./ItemName";
import Select from "./Select";

type Props = {
  label: string;
  items: SlimItem[];
  onChange?: (item?: SlimItem | null) => unknown;
  loading?: boolean;
};

export const comboboxStyles = { display: "inline-block", marginLeft: "5px" };

export default function ItemSelect({ items, label, onChange, loading }: Props) {
  return (
    <Select<SlimItem>
      label={label}
      items={items}
      onChange={onChange}
      itemToString={itemToString}
      loading={loading}
      renderItem={(item) => <ItemName item={item} disambiguate />}
    />
  );
}
