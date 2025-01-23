import { Link, Table } from "@chakra-ui/react";
import type { Player } from "@prisma/client";
import { Link as RRLink } from "react-router";
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
        <Table.ScrollArea whiteSpace="normal">
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Rank</Table.ColumnHeader>
                <Table.ColumnHeader>Item</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="end">
                  Quantity
                </Table.ColumnHeader>
                <Table.ColumnHeader p={0}></Table.ColumnHeader>
              </Table.Row>
            </Table.Header>

            <Table.Body>
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
                        key={player.playerid}
                        asChild
                        css={{ wordWrap: "normal" }}
                      >
                        <RRLink
                          title={`${player.name} #${player.playerid}`}
                          to={`/player/${player.playerid}`}
                        >
                          {player.name}
                        </RRLink>
                      </Link>
                    )),
                  )}
                </Rank>
              ))}
            </Table.Body>
          </Table.Root>
        </Table.ScrollArea>
      )}
    </>
  );
}
