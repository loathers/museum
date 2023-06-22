type Props = {
  names: { oldName: string; when: string }[];
};

export default function Formerly({ names }: Props) {
  return (
    <div style={{ fontSize: "small" }}>
      formerly{" "}
      {names.map((n, i) => (
        <>
          <b title={n.when.substring(0, 10)}>{n.oldName}</b>
          {i < names.length - 2 ? ", " : i < names.length - 1 ? " and " : ""}
        </>
      ))}
    </div>
  );
}
