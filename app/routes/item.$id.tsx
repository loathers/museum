import type { LoaderArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

import { prisma } from "~/lib/prisma.server";
import ItemPageRanking from "~/components/ItemPageRanking";
import { itemToString } from "~/utils";

export async function loadCollections(id: number, take = 999) {
  if (!id) throw json("An item id must be specified", { status: 400 });
  if (id >= 2 ** 31) throw json("Item not found with that id", { status: 404 });

  const item = await prisma.item.findUnique({
    where: {
      id,
    },
    include: {
      collection: {
        select: {
          quantity: true,
          rank: true,
          player: {
            select: {
              name: true,
              id: true,
            },
          },
        },
        orderBy: [{ rank: "asc" }, { player: { name: "asc" } }],
        take,
      },
    },
  });

  if (!item || item.collection.length === 0) {
    throw json("Item not found with that id", { status: 404 });
  }

  return item;
}

export async function loader({ params }: LoaderArgs) {
  const id = Number(params.id);

  return await loadCollections(id);
}

export const meta: MetaFunction<typeof loader> = ({ data: item }) => {
  return {
    title: `Museum :: ${item.name}`,
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

      <blockquote
        style={{
          margin: "0 auto",
          marginBottom: 20,
          background: "#eee",
          padding: "10px 20px",
        }}
      >
        <p
          dangerouslySetInnerHTML={{
            __html: item.description.replace(/\\[rn]/g, ""),
          }}
        />
      </blockquote>

      <ItemPageRanking collections={item.collection} />
    </div>
  );
}
