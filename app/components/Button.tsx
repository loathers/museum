import {
  Button as ChakraButton,
  HStack,
  Span,
  Spinner,
} from "@chakra-ui/react";

type Props = React.ComponentProps<typeof ChakraButton> & {
  loading?: boolean;
  leftIcon?: React.ReactNode;
};

export function Button({
  loading,
  leftIcon,
  disabled,
  children,
  ...props
}: Props) {
  return (
    <ChakraButton variant="subtle" disabled={loading || disabled} {...props}>
      <HStack>
        {loading && <Spinner size="inherit" color="inherit" />}
        {!loading && leftIcon && <Span>{leftIcon}</Span>}
        {children}
      </HStack>
    </ChakraButton>
  );
}
