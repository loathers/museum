import { useEffect, useState } from "react";
import { useFetcher } from "react-router";

import ItemName from "~/components/ItemName";
import Typeahead from "~/components/Typeahead";
import { useDebounce } from "~/hooks";
import { itemToString } from "~/utils";
import type { SlimItem } from "~/utils.server";

type Props = {
  label: string;
  onChange?: (item?: SlimItem | null) => unknown;
  loading?: boolean;
};

export const comboboxStyles = { display: "inline-block", marginLeft: "5px" };

export default function ItemSelect({ label, onChange, loading }: Props) {
  const { load, ...fetcher } = useFetcher();

  const [query, setQuery] = useState<string | undefined>(undefined);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (!debouncedQuery) return;
    load(`/api/items?q=${debouncedQuery}`);
  }, [debouncedQuery, load]);

  return (
    <Typeahead<SlimItem>
      label={label}
      items={(fetcher.data as SlimItem[]) ?? []}
      onChange={onChange}
      onInputChange={setQuery}
      itemToString={itemToString}
      loading={loading || fetcher.state !== "idle"}
      renderItem={(item) => <ItemName item={item} disambiguate />}
    />
  );
}
