import { Button } from "@chakra-ui/react";
import { Link, useNavigation, useResolvedPath } from "@remix-run/react";

type Props = React.ComponentProps<typeof Link> &
  React.ComponentProps<typeof Button>;

export default function ButtonLink({ to, ...props }: Props) {
  const { state, location } = useNavigation();
  const path = useResolvedPath(to);

  const loading = state === "loading" && location.pathname === path.pathname;

  return <Button isLoading={loading} as={Link} to={to} {...props} />;
}
