import { Box, Link, Spinner, Text, type TextProps } from "@chakra-ui/react";
import type { DailyCollection, Player } from "@prisma/client";
import { decodeHTML } from "entities";
import { useEffect, useState } from "react";
import { Link as RRLink } from "react-router";

import { englishJoin, pluralise } from "~/utils";

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
      {englishJoin(
        players.map((p) => (
          <Link key={p.playerid} asChild>
            <RRLink to={`/player/${p.playerid}`} prefetch="intent">
              <Highlighted title={`#${p.playerid}`}>{p.name}</Highlighted>
            </RRLink>
          </Link>
        )),
      )}{" "}
      {players.length === 1 ? "has" : "jointly have"} the most{" "}
      <Link asChild>
        <RRLink to={`/item/${itemid}`} prefetch="intent">
          <Highlighted
            dangerouslySetInnerHTML={{
              __html: decodeHTML(pluralise({ name, plural })),
            }}
          />
        </RRLink>
      </Link>
      .
    </Box>
  );
}
