import type { Item } from "@prisma/client";
import { Link, useFetcher } from "@remix-run/react";
import { useEffect } from "react";
import { itemToString } from "~/utils";
import ItemName from "./ItemName";

type Props = { id: number };

export default function ShowItem({ id }: Props) {
  const fetcher = useFetcher<Item>();

  useEffect(() => {
    console.log(fetcher.state, fetcher.data);
    if (fetcher.state === "idle" && !fetcher.data) {
      fetcher.load(`/api/item/${id}`);
    }
  }, [id, fetcher]);

  if (!fetcher.data) {
    return <>Loading...</>;
  }

  const item = fetcher.data;

  return (
    <Link to={`/item/${item.id}`}>
      <div>
        <img
          src={`https://s3.amazonaws.com/images.kingdomofloathing.com/itemimages/${item.picture}.gif`}
          alt={itemToString(item)}
        />
      </div>
      <ItemName item={item} />
    </Link>
  );
}
