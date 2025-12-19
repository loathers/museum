import { Heading } from "@chakra-ui/react";

import { HOLDER_ID } from "~/utils";

type Props = {
  player: { name: string; playerid: number };
};

const titlesById: Map<number, string> = new Map([
  [845708, "RIP 1967-2025"],
  [HOLDER_ID, "(allowed to add quest items to display case)"],
]);

export default function CustomTitle({ player }: Props) {
  if (!titlesById.has(player.playerid)) return null;

  return (
    <Heading as="h3" size="lg" textAlign="center" fontWeight="normal">
      {titlesById.get(player.playerid)}
    </Heading>
  );
}
