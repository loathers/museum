import { Container, Stack } from "@chakra-ui/react";

type Props = React.PropsWithChildren<{}>;

export default function Layout({ children }: Props) {
  return (
    <Container paddingTop={8} maxWidth="4xl">
      <Stack alignItems="center" spacing={8}>
        {children}
      </Stack>
    </Container>
  );
}
