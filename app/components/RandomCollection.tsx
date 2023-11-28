import type { TextProps } from "@chakra-ui/react";
import { Box, Link, Spinner, Text } from "@chakra-ui/react";
import { Link as RemixLink } from "@remix-run/react";
import type { DailyCollection, Player } from "@prisma/client";
import { useEffect, useState } from "react";
import { englishJoin, pluralise } from "~/utils";
import { decodeHTML } from "entities";

type Props = {
  collections: DailyCollection[];
};

const Highlighted = (props: TextProps) => <Text as="b" {...props} />;

export default function RandomCollection({ collections }: Props) {
  const [collection, setCollection] = useState<DailyCollection | null>(null);
  useEffect(
    () =>
      setCollection(
        collections[Math.floor(Math.random() * collections.length)],
      ),
    [collections],
  );

  if (!collection) return <Spinner />;

  const { itemid, name, plural } = collection;
  const players = collection.players as Pick<Player, "playerid" | "name">[];
  return (
    <Box>
      For example, you can see how{" "}
      <Link as={RemixLink} to={`/item/${itemid}`} prefetch="intent">
        {englishJoin(
          players.map((p) => (
            <Highlighted key={p.playerid} title={`#${p.playerid}`}>
              {p.name}
            </Highlighted>
          )),
        )}{" "}
        {players.length === 1 ? "has" : "jointly have"} the most{" "}
        <Highlighted
          dangerouslySetInnerHTML={{
            __html: decodeHTML(pluralise({ name, plural })),
          }}
        />
      </Link>
      .
    </Box>
  );
}
