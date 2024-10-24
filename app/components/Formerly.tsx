import { Fragment } from "react";

type Props = {
  names: { oldname: string; when: Date }[];
};

export default function Formerly({ names }: Props) {
  if (names.length === 0) return null;

  return (
    <div style={{ fontWeight: "normal", fontSize: "small" }}>
      formerly{" "}
      {names.map((n, i) => (
        <Fragment key={n.when.toString()}>
          <b title={n.when.toLocaleDateString()}>{n.oldname}</b>
          {i < names.length - 2 ? ", " : i < names.length - 1 ? " and " : ""}
        </Fragment>
      ))}
    </div>
  );
}
