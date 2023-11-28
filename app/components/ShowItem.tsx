import { Center } from "@chakra-ui/react";
import { Link, useFetcher } from "@remix-run/react";
import { useEffect } from "react";
import type { loader } from "~/routes/api.item.$id";
import { itemToString } from "~/utils";
import ItemName from "./ItemName";

type Props = { itemid: number };

export default function ShowItem({ itemid }: Props) {
  const fetcher = useFetcher<typeof loader>();

  useEffect(() => {
    if (fetcher.state === "idle" && !fetcher.data) {
      fetcher.load(`/api/item/${itemid}`);
    }
  }, [itemid, fetcher]);

  if (!fetcher.data) {
    return <>Loading...</>;
  }

  const item = fetcher.data;

  const OptionalLink = ({ children }: React.PropsWithChildren<object>) =>
    item.collections.length > 0 ? (
      <Link to={`/item/${item.itemid}`}>{children}</Link>
    ) : (
      <>{children}</>
    );

  return (
    <OptionalLink>
      <Center>
        <img
          src={`https://s3.amazonaws.com/images.kingdomofloathing.com/itemimages/${item.picture}.gif`}
          alt={itemToString(item)}
        />
      </Center>
      <ItemName item={item} />
    </OptionalLink>
  );
}
