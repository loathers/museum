import { Table, Text } from "@chakra-ui/react";

import RankSymbol from "./RankSymbol";

type Props = {
  rank: number;
  quantity: number;
  difference?: number;
  joint: boolean;
  children: React.ReactNode;
};

function bg(rank: number) {
  switch (rank) {
    case 1:
      return "goldmedal";
    case 2:
      return "silvermedal";
    case 3:
      return "bronzemedal";
    default:
      return "transparent";
  }
}

export default function Rank({
  rank,
  joint,
  quantity,
  children,
  difference,
}: Props) {
  return (
    <Table.Row bg={bg(rank)} css={{ "&:hover td p": { opacity: 0.8 } }}>
      <Table.Cell>
        <RankSymbol rank={rank} joint={joint} />
      </Table.Cell>
      <Table.Cell>{children}</Table.Cell>
      <Table.Cell pr={3} textAlign="end">
        {quantity.toLocaleString()}
      </Table.Cell>
      {difference !== undefined && (
        <Table.Cell width="20px" p={0}>
          {difference > 0 && (
            <Text
              title={`${difference.toLocaleString()} more needed to advance rank (+${(
                (difference / quantity) *
                100
              ).toPrecision(3)}%)`}
              cursor="help"
              filter="grayscale(1)"
              opacity={0}
              fontSize={10}
            >
              ⤴️
            </Text>
          )}
        </Table.Cell>
      )}
    </Table.Row>
  );
}
