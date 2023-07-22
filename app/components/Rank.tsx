import { Td, Tr, Text } from "@chakra-ui/react";
import RankSymbol from "./RankSymbol";

type Props = {
  rank: number;
  quantity: number;
  difference?: number;
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
    <Tr backgroundColor={bg(rank)} sx={{ ":hover td p": { opacity: 0.8 } }}>
      <Td>
        <RankSymbol rank={rank} joint={joint} />
      </Td>
      <Td>{children}</Td>
      <Td pr={3} isNumeric>
        {quantity.toLocaleString()}
      </Td>
      {difference !== undefined && (
        <Td width="20px" p={0}>
          {difference > 0 && (
            <Text
              title={`${difference.toLocaleString()} more needed to advance rank (+${(
                (difference / (quantity - difference)) *
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
        </Td>
      )}
    </Tr>
  );
}
