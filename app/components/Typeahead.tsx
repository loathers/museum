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
import { useCallback } from "react";

interface Props<T> {
  items: T[];
  itemToString: (item: T | null) => string;
  label?: string;
  loading?: boolean;
  onChange?: (item: T | null) => unknown;
  onInputChange?: (inputValue: string | undefined) => unknown;
  renderItem: (item: T) => React.ReactNode;
}

export const comboboxStyles = { display: "inline-block", marginLeft: "5px" };

export default function Select<T>({
  items,
  itemToString,
  label,
  onChange,
  onInputChange,
  renderItem,
  loading,
}: Props<T>) {
  const {
    isOpen,
    getToggleButtonProps,
    getLabelProps,
    getMenuProps,
    highlightedIndex,
    getItemProps,
    getInputProps,
  } = useCombobox({
    items,
    itemToString,
    onInputValueChange: ({ inputValue }) => {
      onInputChange?.(inputValue);
    },
    onSelectedItemChange: (p) => onChange?.(p.selectedItem),
  });

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== "Enter") return;
      const item = items.find(
        (i) =>
          itemToString(i).toLowerCase() ===
          event.currentTarget.value.toLowerCase(),
      );
      if (!item) return;
      onChange?.(item);
    },
    [itemToString, items, onChange],
  );

  return (
    <Stack align="center">
      {label && <label {...getLabelProps()}>{label}</label>}
      <div style={{ display: "inline-block", position: "relative" }}>
        <InputGroup>
          <Input
            {...getInputProps({
              onKeyDown: handleKeyDown,
            })}
          />
          <InputRightAddon width="40px" padding={0} overflow="hidden">
            <Button
              borderRadius={0}
              {...getToggleButtonProps({
                disabled: items.length === 0,
              })}
              aria-label="toggle menu"
              isLoading={loading}
            >
              {isOpen && items.length > 0 ? <>&#8593;</> : <>&#8595;</>}
            </Button>
          </InputRightAddon>
        </InputGroup>
        <List
          {...getMenuProps()}
          display={isOpen && items.length > 0 ? "block" : "none"}
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
            items.map((item, index) => (
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
