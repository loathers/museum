import {
  Button,
  Input,
  InputGroup,
  InputRightAddon,
  List,
  ListItem,
  Stack,
} from "@chakra-ui/react";
import { useCombobox } from "downshift";
import { useState } from "react";

interface Props<T> {
  label?: string;
  items: T[];
  onChange?: (item: T | null) => unknown;
  onInputChange?: (inputValue: string | undefined) => unknown;
  itemToString: (item: T | null) => string;
  loading?: boolean;
  renderItem: (item: T) => React.ReactNode;
}

export const comboboxStyles = { display: "inline-block", marginLeft: "5px" };

export default function Select<T>({
  items,
  label,
  itemToString,
  onChange,
  onInputChange,
  renderItem,
  loading,
}: Props<T>) {
  const [inputItems, setInputItems] = useState<T[]>([]);

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
      onInputChange?.(inputValue);
      setInputItems(
        inputValue
          ? items.filter((item) =>
              itemToString(item)
                .toLowerCase()
                .includes(inputValue.toLowerCase()),
            )
          : [],
      );
    },
    onSelectedItemChange: (p) => onChange?.(p.selectedItem),
  });

  return (
    <Stack align="center">
      {label && <label {...getLabelProps()}>{label}</label>}
      <div style={{ display: "inline-block", position: "relative" }}>
        <InputGroup>
          <Input {...getInputProps()} />
          <InputRightAddon width="40px" padding={0} overflow="hidden">
            <Button
              borderRadius={0}
              {...getToggleButtonProps({
                disabled: inputItems.length === 0,
              })}
              aria-label="toggle menu"
              isLoading={loading}
            >
              {isOpen && inputItems.length > 0 ? <>&#8593;</> : <>&#8595;</>}
            </Button>
          </InputRightAddon>
        </InputGroup>
        <List
          {...getMenuProps()}
          display={isOpen && inputItems.length > 0 ? "block" : "none"}
          backgroundColor="chakra-body-bg"
          borderStyle="solid"
          borderWidth={1}
          borderColor="chakra-border-color"
          borderRadius="md"
          maxHeight="180px"
          overflowY="auto"
          width={300}
          margin={0}
          marginTop={2}
          position="absolute"
          zIndex={1000}
          paddingX={0}
          paddingY={2}
        >
          {isOpen &&
            inputItems.map((item, index) => (
              <ListItem
                paddingX={3}
                paddingY="6px"
                backgroundColor={
                  highlightedIndex === index ? "gray.100" : undefined
                }
                key={`${item}${index}`}
                {...getItemProps({ item, index })}
              >
                {renderItem(item)}
              </ListItem>
            ))}
        </List>
      </div>
    </Stack>
  );
}
