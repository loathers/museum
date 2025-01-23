import { Link as ChakraLink } from "@chakra-ui/react";
import { LuExternalLink } from "react-icons/lu";
import {
  Link as RRLink,
  type To,
  useNavigation,
  useResolvedPath,
} from "react-router";

import { Button } from "./Button";

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
        <RRLink to={to}>{children}</RRLink>
      )}
    </Button>
  );
}
