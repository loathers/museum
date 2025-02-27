import { Alert, HStack, Link, Text } from "@chakra-ui/react";
import { Link as RRLink } from "react-router";

import type { Collection } from "~/components/ItemPageRanking";
import { HOLDER_ID } from "~/utils";

type Props = {
  groups: Map<number, Collection[]>;
};

export default function CollectionInsights({ groups }: Props) {
  const keys = [...groups.keys()];

  if (keys.length > 1) return null;

  if (keys.length === 0)
    return (
      <Alert.Root status="warning">
        <Alert.Content alignItems="center">
          <Alert.Title>No-one has this item in their display case</Alert.Title>
          <Alert.Description>
            Not even{" "}
            <Link asChild>
              <RRLink to={`/player/${HOLDER_ID}`}>HOldeRofSecrEts</RRLink>
            </Link>
            !
          </Alert.Description>
        </Alert.Content>
      </Alert.Root>
    );

  const group = groups.get(keys[0])!;

  if (group.length === 1 && group[0].player.playerid === HOLDER_ID) {
    const holder = group[0].player;
    return (
      <Alert.Root status="warning">
        <Alert.Description textAlign="center">
          Looks like{" "}
          <Link asChild>
            <RRLink to={`/player/${holder.playerid}`}>{holder.name}</RRLink>
          </Link>{" "}
          is the only player with one of these in their display case. Holder has{" "}
          <Link
            target="_blank"
            rel="noopener noreferrer"
            href="https://www.reddit.com/r/kol/comments/o3nzo4/holderofsecretss_collection_how_does_he_do_that/h2czvsv/"
          >
            special rights
          </Link>{" "}
          to put quest items and the like in his DC. So he wins by default.
          DEFAULT! DEFAULT!
        </Alert.Description>
      </Alert.Root>
    );
  }

  // If more than one person has this item but the top collections only have 1...
  if (group.length > 1 && group[0].quantity === 1) {
    return (
      <Alert.Root colorPalette="pink" flexDirection="column">
        <Alert.Content alignItems="center">
          <Alert.Title>
            <HStack>
              <Text>🥳</Text>
              <Text
                css={{
                  animation: "rainbow 1s linear infinite",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                Everyone's a winner
              </Text>
              <Text>🍾</Text>
            </HStack>
          </Alert.Title>
          <Alert.Description textAlign="center">
            Looks like everyone just has one of this item in their display case,
            so you can probably only get one per account. Nevertheless, well
            done them.
          </Alert.Description>
        </Alert.Content>
      </Alert.Root>
    );
  }

  return null;
}
