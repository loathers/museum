type Props = {
  names: { oldname: string; when: string }[];
};

export default function Formerly({ names }: Props) {
  if (names.length === 0) return null;

  return (
    <div style={{ fontWeight: "normal", fontSize: "small" }}>
      formerly{" "}
      {names.map((n, i) => (
        <>
          <b title={n.when.substring(0, 10)}>{n.oldname}</b>
          {i < names.length - 2 ? ", " : i < names.length - 1 ? " and " : ""}
        </>
      ))}
    </div>
  );
}
