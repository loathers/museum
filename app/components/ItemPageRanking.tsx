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

type SlimPlayer = Pick<Player, "playerid" | "name">;

export type Collection = {
  quantity: number;
  rank: number;
  player: SlimPlayer;
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
    const group = map.get(key) || [];
    group.push(array[i]);
    if (!map.has(key)) map.set(key, group);
  }
  return map;
}

export default function ItemPageRanking({ collections }: Props) {
  const grouped = groupToMap(collections, (c) => c.rank);
  const groups = [...grouped.entries()]
    .sort(([a], [b]) => a - b)
    .map(([, g]) => g);

  return (
    <>
      <CollectionInsights groups={grouped} />

      {collections.length > 0 && (
        <TableContainer whiteSpace="normal">
          <Table>
            <Thead>
              <Tr>
                <Th>Rank</Th>
                <Th>Item</Th>
                <Th isNumeric>Quantity</Th>
                <Th p={0}></Th>
              </Tr>
            </Thead>

            <Tbody>
              {groups.map((c, i, a) => (
                <Rank
                  key={c[0].rank}
                  rank={c[0].rank}
                  difference={i > 0 ? a[i - 1][0].quantity - c[0].quantity : 0}
                  quantity={c[0].quantity}
                  joint={c.length > 1}
                >
                  {englishJoin(
                    c.map(({ player }) => (
                      <Link
                        as={RemixLink}
                        key={player.playerid}
                        title={`${player.name} #${player.playerid}`}
                        to={`/player/${player.playerid}`}
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
