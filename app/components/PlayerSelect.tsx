import type { Player } from "@prisma/client";

import Select from "./Select";

type Props = {
  label: string;
  players: Player[];
  onChange?: (player?: Player | null) => unknown;
  loading?: boolean;
};

export const menuStyles = (isOpen: boolean) => ({
  maxHeight: "180px",
  overflowY: "auto",
  width: "300px",
  margin: 0,
  border: isOpen ? "1px solid black" : 0,
  background: "white",
  position: "absolute",
  zIndex: 1000,
  listStyle: "none",
  padding: 0,
});

export const comboboxStyles = { display: "inline-block", marginLeft: "5px" };

export default function PlayerSelect({
  players,
  label,
  onChange,
  loading,
}: Props) {
  return (
    <Select<Player>
      items={players}
      itemToString={(player) => player?.name ?? ""}
      loading={loading}
      onChange={onChange}
      label={label}
      renderItem={(player) => player?.name ?? ""}
    />
  );
}
