import type { Item } from "@prisma/client";
import { useCombobox } from "downshift";
import { useState } from "react";
import { itemToString } from "~/utils";
import ItemName from "./ItemName";
import Loading from "./Loading";

type Props = {
  label: string;
  items: Item[];
  onChange?: (item?: Item | null) => unknown;
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

export default function ItemSelect({ items, label, onChange, loading }: Props) {
  const [inputItems, setInputItems] = useState([] as Item[]);

  const {
    isOpen,
    getToggleButtonProps,
    getLabelProps,
    getMenuProps,
    highlightedIndex,
    getItemProps,
    getInputProps,
  } = useCombobox({
    items: inputItems,
    itemToString,
    onInputValueChange: ({ inputValue }) => {
      setInputItems(
        inputValue
          ? items.filter((item) =>
              itemToString(item)
                .toLowerCase()
                .startsWith(inputValue.toLowerCase())
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
              disabled: inputItems.length === 0,
            })}
            aria-label="toggle menu"
          >
            {loading ? (
              <Loading />
            ) : isOpen && inputItems.length > 0 ? (
              <>&#8593;</>
            ) : (
              <>&#8595;</>
            )}
          </button>
        </div>
        <ul
          {...getMenuProps()}
          style={menuStyles(isOpen && inputItems.length > 0)}
        >
          {isOpen &&
            inputItems.map((item, index) => (
              <li
                style={
                  highlightedIndex === index
                    ? { backgroundColor: "#bde4ff" }
                    : {}
                }
                key={`${item}${index}`}
                {...getItemProps({ item, index })}
              >
                <ItemName item={item} disambiguate />
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}
