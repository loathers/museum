import { prisma } from "~/lib/prisma.server";
import type { LoaderArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import Ranking from "~/components/Ranking";

export async function loader({ params }: LoaderArgs) {
  const id = Number(params.id);

  if (!id) throw json("An item id must be specified", { status: 400 });
  if (id >= 2 ** 31) throw json("Item not found with that id", { status: 404 });

  const item = await prisma.item.findUnique({
    where: { id },
    select: {
      name: true,
      picture: true,
      plural: true,
      description: true,
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
        orderBy: [{ rank: "asc" }, { playerId: "asc" }],
        take: 999,
      },
    },
  });

  if (!item) throw json("Item not found with that id", { status: 404 });

  return item;
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return {
    title: `Museum :: ${data.name}`,
  };
};

export default function Item() {
  const data = useLoaderData<typeof loader>();

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
          src={`https://s3.amazonaws.com/images.kingdomofloathing.com/itemimages/${data.picture}.gif`}
          alt={data.name}
          style={{ marginRight: "0.7em" }}
        />

        <h2>{data.name}</h2>
      </div>

      <blockquote
        style={{
          margin: "0 auto",
          marginBottom: 20,
          background: "#eee",
          padding: "10px 20px",
        }}
      >
        <p dangerouslySetInnerHTML={{ __html: data.description }} />
      </blockquote>

      <Ranking collections={data.collection} />
    </div>
  );
}
