import { Link } from "@remix-run/react";
import type { Collection } from "./Ranking";

type Props = {
  groups: Map<number, Collection[]>;
};

export default function CollectionInsights({ groups }: Props) {
  const keys = [...groups.keys()];
  if (keys.length > 1) return null;

  const group = groups.get(keys[0])!;

  if (group.length === 1 && group[0].player.id === 216194) {
    const holder = group[0].player;
    return (
      <div
        style={{
          margin: "0 auto",
          marginBottom: 10,
          background: "#eee",
          border: "4px solid red",
          padding: "10px 20px",
        }}
      >
        Looks like <Link to={`/player/${holder.id}`}>{holder.name}</Link> is the
        only player with one of these in their display case. Holder has{" "}
        <a href="https://www.reddit.com/r/kol/comments/o3nzo4/holderofsecretss_collection_how_does_he_do_that/h2czvsv/">
          special rights
        </a>{" "}
        to put quest items and the like in his DC. So he wins by default.
        DEFAULT!&nbsp;DEFAULT!
      </div>
    );
  }

  // If more than one person has this item but the top collections only have 1...
  if (group.length > 1 && group[0].quantity === 1) {
    return (
      <div
        style={{
          margin: "0 auto",
          marginBottom: 10,
          background: "#FFEAED",
          padding: "10px 20px 30px 20px",
        }}
      >
        <h3>
          🥳{" "}
          <span style={{ animation: "rainbow 1s linear infinite" }}>
            Everyone's a winner
          </span>{" "}
          🍾
        </h3>
        Looks like everyone just has one of this item in their display case, so
        you can probably only get one per account. Nevertheless, well done them.
      </div>
    );
  }

  return null;
}
