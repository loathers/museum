import type { Player } from "@prisma/client";

import { useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";
import Typeahead from "./Typeahead";
import { useDebounce } from "~/hooks";

type Props = {
  label: string;
  onChange?: (player: Player | null) => unknown;
  loading?: boolean;
};

export const comboboxStyles = { display: "inline-block", marginLeft: "5px" };

const playerToString = (player: Player | null) => player?.name ?? "";

export default function ItemSelect({ label, onChange, loading }: Props) {
  const { load, ...fetcher} = useFetcher();

  const [query, setQuery] = useState<string | undefined>(undefined);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (!debouncedQuery) return;
    load(`/api/players?q=${debouncedQuery}`);
  }, [debouncedQuery, load]);

  return (
    <Typeahead<Player>
      label={label}
      items={(fetcher.data as Player[]) ?? []}
      onChange={onChange}
      onInputChange={setQuery}
      itemToString={playerToString}
      loading={loading || fetcher.state !== "idle"}
      renderItem={playerToString}
    />
  );
}
