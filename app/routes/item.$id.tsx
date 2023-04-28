import type { LoaderArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

import ItemDescription from "~/components/ItemDescription";
import ItemPageRanking from "~/components/ItemPageRanking";
import { HTTPError, itemToString, loadCollections } from "~/utils";

export async function loader({ params }: LoaderArgs) {
  const id = Number(params.id);
  try {
    const collections = await loadCollections(id);
    return json(collections);
  } catch (error) {
    if (!(error instanceof HTTPError)) throw error;
    throw json(error.message, { status: error.status });
  }
}

export const meta: MetaFunction<typeof loader> = ({ data: item }) => {
  return {
    title: `Museum :: ${itemToString(item)}`,
  };
};

export default function Item() {
  const item = useLoaderData<typeof loader>();

  return (
    <div
      style={{
        fontFamily: "system-ui, sans-serif",
        lineHeight: "1.4",
        textAlign: "center",
        maxWidth: 780,
        padding: "0 20px",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          src={`https://s3.amazonaws.com/images.kingdomofloathing.com/itemimages/${item.picture}.gif`}
          alt={itemToString(item)}
          style={{ marginRight: "0.7em" }}
        />

        <h2 dangerouslySetInnerHTML={{ __html: item.name }} />
      </div>
      <div style={{ marginBottom: 20 }}>
        <Link to="/">[← home]</Link>
        <a
          href={`https://kol.coldfront.net/thekolwiki/index.php/${itemToString(
            item
          )}`}
        >
          [
          <img
            src="/coldfront.png"
            alt="Wiki link"
            style={{ width: "1em", verticalAlign: "middle" }}
          />{" "}
          wiki]
        </a>
      </div>

      <ItemDescription description={item.description} />

      <ItemPageRanking collections={item.collection} />
    </div>
  );
}
