import { Td, Tr, Text } from "@chakra-ui/react";
import RankSymbol from "./RankSymbol";

type Props = {
  rank: number;
  quantity: number;
  difference?: number | null;
  joint: boolean;
  children: React.ReactNode;
};

function bg(rank: number): React.CSSProperties["backgroundColor"] {
  switch (rank) {
    case 1:
      return "#fad25a";
    case 2:
      return "#cbcace";
    case 3:
      return "#cea972";
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
    <>
      <Tr backgroundColor={bg(rank)} padding={rank > 3 ? undefined : 10}>
        <Td>
          <RankSymbol rank={rank} joint={joint} />
        </Td>
        <Td>{children}</Td>
        <Td>{quantity.toLocaleString()}</Td>
      </Tr>
      {difference && (
        <Tr>
          <Td paddingY={1} colSpan={2}></Td>
          <Td paddingY={1}>
            <Text
              title={`${difference.toLocaleString()} (+${(
                (difference / (quantity - difference)) *
                100
              ).toPrecision(3)}%)`}
              cursor="help"
              filter="grayscale(1) opacity(0.5)"
              fontSize={10}
            >
              ↕️
            </Text>
          </Td>
        </Tr>
      )}
    </>
  );
}
