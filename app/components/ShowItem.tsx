import { Center } from "@chakra-ui/react";
import { useEffect } from "react";
import { Link, useFetcher } from "react-router";

import ItemName from "~/components/ItemName";
import { type LoaderReturnType } from "~/routes/api.item.$id";
import { itemToString } from "~/utils";

type Props = { itemid: number };

export default function ShowItem({ itemid }: Props) {
  const fetcher = useFetcher<LoaderReturnType>();

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
