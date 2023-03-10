import type { Player } from "@prisma/client";
import { useCombobox } from "downshift";
import { useState } from "react";
import Loading from "./Loading";

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

export default function ItemSelect({
  players,
  label,
  onChange,
  loading,
}: Props) {
  const [inputPlayers, setInputPlayers] = useState([] as Player[]);

  const {
    isOpen,
    getToggleButtonProps,
    getLabelProps,
    getMenuProps,
    highlightedIndex,
    getItemProps,
    getInputProps,
  } = useCombobox({
    items: inputPlayers,
    itemToString: (p) => p?.name ?? "",
    onInputValueChange: ({ inputValue }) => {
      setInputPlayers(
        inputValue
          ? players.filter((player) =>
              player.name.toLowerCase().startsWith(inputValue.toLowerCase())
            )
          : []
      );
    },
    onSelectedItemChange: (p) => onChange?.(p.selectedItem),
  });

  return (
    <div>
      <label {...getLabelProps()}>{label}</label>
      <div style={{ display: "inline-block", position: "relative" }}>
        <div style={comboboxStyles}>
          <input {...getInputProps()} />
          <button
            type="button"
            {...getToggleButtonProps({
              disabled: inputPlayers.length === 0,
            })}
            aria-label="toggle menu"
          >
            {loading ? (
              <Loading />
            ) : isOpen && inputPlayers.length > 0 ? (
              <>&#8593;</>
            ) : (
              <>&#8595;</>
            )}
          </button>
        </div>
        <ul
          {...getMenuProps()}
          style={menuStyles(isOpen && inputPlayers.length > 0)}
        >
          {isOpen &&
            inputPlayers.map((player, index) => (
              <li
                style={
                  highlightedIndex === index
                    ? { backgroundColor: "#bde4ff" }
                    : {}
                }
                key={`${player.id}`}
                {...getItemProps({ item: player, index })}
              >
                {player.name}
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}
