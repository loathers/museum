import { Link as ChakraLink } from "@chakra-ui/react";
import {
  Link as RemixLink,
  useNavigation,
  useResolvedPath,
} from "@remix-run/react";
import { type To } from "@remix-run/router";

import { Button } from "./Button";

type Props = React.ComponentProps<typeof Button> & { to: To };

export default function ButtonLink({ to, children, ...props }: Props) {
  const { state, location } = useNavigation();
  const path = useResolvedPath(to);

  const loading = state === "loading" && location.pathname === path.pathname;

  const external = to && !to.toString().startsWith("/");

  return (
    <Button asChild loading={loading} {...props}>
      {external ? (
        <ChakraLink
          href={to.toString()}
          target="_blank"
          rel="noopener noreferrer"
        >
          {children}
        </ChakraLink>
      ) : (
        <RemixLink to={to}>{children}</RemixLink>
      )}
    </Button>
  );
}
