import { useEffect, useState } from "react";
import { useFetcher } from "react-router";

import Typeahead from "~/components/Typeahead";
import type { Player } from "~/db.types";
import { useDebounce } from "~/hooks";

type SlimPlayer = Pick<Player, "playerid" | "name">;

type Props = {
  label: string;
  onChange?: (player: SlimPlayer | null) => unknown;
  loading?: boolean;
};

export const comboboxStyles = { display: "inline-block", marginLeft: "5px" };

const playerToString = (player: SlimPlayer | null) => player?.name ?? "";

export default function ItemSelect({ label, onChange, loading }: Props) {
  const { load, ...fetcher } = useFetcher();

  const [query, setQuery] = useState<string | undefined>(undefined);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (!debouncedQuery) return;
    load(`/api/players?q=${debouncedQuery}`);
  }, [debouncedQuery, load]);

  return (
    <Typeahead<SlimPlayer>
      label={label}
      items={(fetcher.data as SlimPlayer[]) ?? []}
      onChange={onChange}
      onInputChange={setQuery}
      itemToString={playerToString}
      loading={loading || fetcher.state !== "idle"}
      renderItem={playerToString}
    />
  );
}
