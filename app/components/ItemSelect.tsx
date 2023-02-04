import type { Item } from "@prisma/client";
import { useCombobox } from "downshift";
import { useState } from "react";
import { itemToString } from "~/utils";
import ItemName from "./ItemName";

type Props = {
  label: string;
  items: Item[];
  onChange: (item?: Item | null) => unknown;
};

export const menuStyles = {
  maxHeight: "180px",
  overflowY: "auto",
  width: "300px",
  margin: 0,
  borderTop: 0,
  background: "white",
  position: "absolute",
  zIndex: 1000,
  listStyle: "none",
  padding: 0,
};

export const comboboxStyles = { display: "inline-block", marginLeft: "5px" };

export default function ItemSelect({ items, label, onChange }: Props) {
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
    onSelectedItemChange: (p) => onChange(p.selectedItem),
  });

  return (
    <div>
      <label {...getLabelProps()}>{label}</label>
      <div style={{ display: "inline-block", position: "relative" }}>
        <div style={comboboxStyles}>
          <input {...getInputProps()} />
          <button
            type="button"
            {...getToggleButtonProps()}
            aria-label="toggle menu"
          >
            {isOpen && inputItems.length > 0 ? <>&#8593;</> : <>&#8595;</>}
          </button>
        </div>
        <ul {...getMenuProps()} style={menuStyles}>
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
