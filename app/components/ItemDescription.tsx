import { chakra, Alert, Stack } from "@chakra-ui/react";
import ShowItem from "./ShowItem";

function DescriptionParagraph({
  value,
  spacing,
}: {
  value: string;
  spacing: number;
}) {
  return (
    <chakra.div
      sx={{ display: "flex", flexDirection: "column", gap: spacing }}
      dangerouslySetInnerHTML={{ __html: value }}
    />
  );
}

function DescriptionMacro({ type, value }: { type: string; value: number }) {
  const contents = (() => {
    switch (type) {
      case "showitem":
        return <ShowItem itemid={value} />;
      default:
        return `${type}:${value}`;
    }
  })();
  return (
    <Alert bg="white" display="inline-flex" width="auto">
      {contents}
    </Alert>
  );
}

type Props = {
  description: string | null;
  spacing?: number;
};

export default function ItemDescription({ description, spacing = 2 }: Props) {
  const contents = ("<p>" + (description || ""))
    .replace(/\\[rn]/g, "")
    .split(/(showitem): ?(\d+)/)
    .map((value, i, arr) => {
      switch (i % 3) {
        case 0:
          return (
            <DescriptionParagraph key={i} spacing={spacing} value={value} />
          );
        case 1:
          return (
            <DescriptionMacro key={i} type={value} value={Number(arr[i + 1])} />
          );
        default:
          return null;
      }
    });

  return (
    <Alert flexDirection="column" textAlign="center">
      <Stack alignItems="center" spacing={spacing}>
        {contents}
      </Stack>
    </Alert>
  );
}
