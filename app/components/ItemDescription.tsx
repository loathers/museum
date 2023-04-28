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
    <blockquote
      style={{
        display: "inline-block",
        marginBottom: 20,
        padding: "10px 20px",
        backgroundColor: "white",
        border: "1px solid black",
      }}
    >
      {contents}
    </blockquote>
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
          return <DescriptionMacro type={value} value={Number(arr[i + 1])} />;
        default:
          return null;
      }
    });

  return (
    <blockquote
      style={{
        margin: "0 auto",
        marginBottom: 20,
        background: "#eee",
        padding: "10px 20px",
      }}
    >
      {contents}
    </blockquote>
  );
}
