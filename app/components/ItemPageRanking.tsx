import {
  Link,
  Table,
  TableContainer,
  Tbody,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import type { Player } from "@prisma/client";
import { Link as RemixLink } from "@remix-run/react";
import { englishJoin } from "~/utils";
import CollectionInsights from "./CollectionInsights";
import Rank from "./Rank";

export type Collection = {
  quantity: number;
  rank: number;
  player: Player;
};

type Props = {
  collections: Collection[];
};

function groupToMap<K, V>(
  array: V[],
  callbackFn: (element: V, index?: number, array?: V[]) => K,
) {
  const map = new Map<K, V[]>();
  for (let i = 0; i < array.length; i++) {
    const key = callbackFn(array[i], i, array);
    if (!map.has(key)) map.set(key, [] as V[]);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    map.get(key)!.push(array[i]);
  }
  return map;
}

export default function ItemPageRanking({ collections }: Props) {
  const grouped = groupToMap(collections, (c) => c.rank);
  const keys = [...grouped.keys()].sort((a, b) => a - b);

  return (
    <>
      <CollectionInsights groups={grouped} />

      {collections.length > 0 && (
        <TableContainer whiteSpace="normal">
          <Table layout="fixed">
            <Thead>
              <Tr>
                <Th>Rank</Th>
                <Th>Item</Th>
                <Th>Quantity</Th>
                <Th p={0} width="20px"></Th>
              </Tr>
            </Thead>

            <Tbody>
              {keys
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                .map((k) => grouped.get(k)!)
                .map((c, i, a) => (
                  <Rank
                    key={c[0].rank}
                    rank={c[0].rank}
                    difference={
                      i > 0 ? a[i - 1][0].quantity - c[0].quantity : 0
                    }
                    quantity={c[0].quantity}
                    joint={c.length > 1}
                  >
                    {englishJoin(
                      c.map(({ player }) => (
                        <Link
                          as={RemixLink}
                          key={player.id}
                          title={`${player.name} #${player.id}`}
                          to={`/player/${player.id}`}
                          sx={{ wordWrap: "normal" }}
                        >
                          {player.name}
                        </Link>
                      )),
                    )}
                  </Rank>
                ))}
            </Tbody>
          </Table>
        </TableContainer>
      )}
    </>
  );
}
