import { Link as ChakraLink } from "@chakra-ui/react";
import {
  Link as RemixLink,
  useNavigation,
  useResolvedPath,
} from "@remix-run/react";
import { type To } from "@remix-run/router";

import { Button } from "./Button";
import { LuExternalLink } from "react-icons/lu";

type Props = React.ComponentProps<typeof Button> & { to: To };

export default function ButtonLink({
  to,
  children,
  leftIcon,
  ...props
}: Props) {
  const { state, location } = useNavigation();
  const path = useResolvedPath(to);

  const loading = state === "loading" && location.pathname === path.pathname;

  const external = to && !to.toString().startsWith("/");

  return (
    <Button
      asChild
      loading={loading}
      leftIcon={!external && leftIcon}
      {...props}
    >
      {external ? (
        <ChakraLink
          href={to.toString()}
          target="_blank"
          rel="noopener noreferrer"
          variant="plain"
        >
          {leftIcon}
          {children}
          <LuExternalLink />
        </ChakraLink>
      ) : (
        <RemixLink to={to}>{children}</RemixLink>
      )}
    </Button>
  );
}
