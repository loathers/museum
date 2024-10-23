import {
  AbsoluteCenter,
  Button as ChakraButton,
  HStack,
  Span,
  Spinner,
} from "@chakra-ui/react";

type Props = React.ComponentProps<typeof ChakraButton> & {
  loading?: boolean;
  loadingText?: React.ReactNode;
  leftIcon?: React.ReactNode;
};

export function Button({
  loading,
  loadingText,
  leftIcon,
  disabled,
  children,
  ...props
}: Props) {
  return (
    <ChakraButton variant="subtle" disabled={loading || disabled} {...props}>
      {loading ? (
        loadingText ? (
          <>
            <Spinner size="inherit" color="inherit" />
            {loadingText}
          </>
        ) : (
          <>
            <AbsoluteCenter display="inline-flex">
              <Spinner size="inherit" color="inherit" />
            </AbsoluteCenter>
            <Span opacity={0}>{children}</Span>
          </>
        )
      ) : (
        <HStack>
          {leftIcon && <Span>{leftIcon}</Span>}
          {children}
        </HStack>
      )}
    </ChakraButton>
  );
}
