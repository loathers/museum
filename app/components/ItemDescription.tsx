import { Alert } from "@chakra-ui/react";
import ShowItem from "./ShowItem";

function DescriptionParagraph({ value }: { value: string }) {
  return <p dangerouslySetInnerHTML={{ __html: value }} />;
}

function DescriptionMacro({ type, value }: { type: string; value: number }) {
  const contents = (() => {
    switch (type) {
      case "showitem":
        return <ShowItem id={value} />;
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
  description: string;
};

export default function ItemDescription({ description }: Props) {
  const contents = description
    .replace(/\\[rn]/g, "")
    .split(/(showitem): ?(\d+)/)
    .map((value, i, arr) => {
      switch (i % 3) {
        case 0:
          return <DescriptionParagraph key={i} value={value} />;
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
      {contents}
    </Alert>
  );
}
