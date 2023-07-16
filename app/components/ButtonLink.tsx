import { Button, Link as ChakraLink } from "@chakra-ui/react";
import {
  Link as RemixLink,
  useNavigation,
  useResolvedPath,
} from "@remix-run/react";

type Props = React.ComponentProps<typeof RemixLink> &
  React.ComponentProps<typeof Button>;

export default function ButtonLink({ to, ...props }: Props) {
  const { state, location } = useNavigation();
  const path = useResolvedPath(to);

  const loading = state === "loading" && location.pathname === path.pathname;

  const linkingProps = to.toString().startsWith("/")
    ? {
        as: RemixLink,
        to,
      }
    : { as: ChakraLink, href: to, isExternal: true };

  return <Button isLoading={loading} {...linkingProps} {...props} />;
}
