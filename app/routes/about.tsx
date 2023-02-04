import { Link } from "@remix-run/react";

export default function About() {
  return (
    <div
      style={{
        fontFamily: "system-ui, sans-serif",
        lineHeight: "1.4",
        textAlign: "center",
      }}
    >
      <h1>About</h1>
      <div style={{ marginBottom: 20 }}>
        <Link to="/">[← home]</Link>
      </div>
      <p>
        Museum is made by <Link to="/player/1197090">gausie</Link> from a closed
        data feed provided by TPTB.
      </p>
      <p>
        It is inspired by the (currently much more powerful) service provided by
        the <a href="http://dcdb.coldfront.net">Display Case Database</a> hosted
        by Coldfront for many years.
      </p>
      <p>
        The source for the website itself is hosted on{" "}
        <a href="https://github.com/loathers/museum">GitHub</a>.
      </p>
    </div>
  );
}
