import {
  Alert,
  AlertDescription,
  AlertTitle,
  HStack,
  Link,
  Text,
} from "@chakra-ui/react";
import { Link as RemixLink } from "@remix-run/react";

import type { Collection } from "./ItemPageRanking";

type Props = {
  groups: Map<number, Collection[]>;
};

const HOLDER_ID = 216194;

export default function CollectionInsights({ groups }: Props) {
  const keys = [...groups.keys()];

  if (keys.length > 1) return null;

  if (keys.length === 0)
    return (
      <Alert status="warning" flexDirection="column">
        <AlertTitle>No-one has this item in their display case</AlertTitle>
        <AlertDescription textAlign="center">
          Not even{" "}
          <Link as={RemixLink} to={`/player/${HOLDER_ID}`}>
            HOldeRofSecrEts
          </Link>
          !
        </AlertDescription>
      </Alert>
    );

  const group = groups.get(keys[0])!;

  if (group.length === 1 && group[0].player.id === HOLDER_ID) {
    const holder = group[0].player;
    return (
      <Alert status="warning">
        <AlertDescription textAlign="center">
          Looks like{" "}
          <Link as={RemixLink} to={`/player/${holder.id}`}>
            {holder.name}
          </Link>{" "}
          is the only player with one of these in their display case. Holder has{" "}
          <Link
            isExternal={true}
            as={RemixLink}
            href="https://www.reddit.com/r/kol/comments/o3nzo4/holderofsecretss_collection_how_does_he_do_that/h2czvsv/"
          >
            special rights
          </Link>{" "}
          to put quest items and the like in his DC. So he wins by default.
          DEFAULT! DEFAULT!
        </AlertDescription>
      </Alert>
    );
  }

  // If more than one person has this item but the top collections only have 1...
  if (group.length > 1 && group[0].quantity === 1) {
    return (
      <Alert bg="#FFEAED" flexDirection="column">
        <AlertTitle>
          <HStack>
            <Text>🥳</Text>
            <Text sx={{ animation: "rainbow 1s linear infinite" }}>
              Everyone's a winner
            </Text>
            <Text>🍾</Text>
          </HStack>
        </AlertTitle>
        <AlertDescription textAlign="center">
          Looks like everyone just has one of this item in their display case,
          so you can probably only get one per account. Nevertheless, well done
          them.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
