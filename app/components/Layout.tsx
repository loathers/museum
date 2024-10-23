import { Container, Stack } from "@chakra-ui/react";

type Props = React.PropsWithChildren<{ alignment?: "center" | "stretch" }>;

export default function Layout({ children, alignment = "center" }: Props) {
  return (
    <Container paddingY={8} maxWidth="4xl">
      <Stack alignItems={alignment} gap={8}>
        {children}
      </Stack>
    </Container>
  );
}
