import { Button, Heading, IconButton, Image, Stack } from "@chakra-ui/react";
import { LuArrowLeft, LuArrowRight, LuHouse } from "react-icons/lu";
import { Link as RRLink, useLoaderData } from "react-router";

import { Route } from "./+types/api.item.$id";
import ItemDescription from "~/components/ItemDescription";
import ItemPageRanking from "~/components/ItemPageRanking";
import Layout from "~/components/Layout";
import { db } from "~/db.server";
import { itemToString } from "~/utils";
import { HttpError, type SlimItem, loadCollections } from "~/utils.server";

export const loader = async ({ params }: Route.LoaderArgs) => {
  const id = Number(params.id);
  console.log(params, id);
  try {
    return {
      item: await loadCollections(id),
      prev: await db.item.findFirst({
        where: { itemid: { lt: id }, seen: { isNot: null }, missing: false },
        orderBy: { itemid: "desc" },
      }),
      next: await db.item.findFirst({
        where: { itemid: { gt: id }, seen: { isNot: null }, missing: false },
        orderBy: { itemid: "asc" },
      }),
    };
  } catch (error) {
    if (error instanceof HttpError) throw error.toRouteError();
    throw error;
  }
};

export const meta = ({ data: { item } }: Route.MetaArgs) => [
  { title: `Museum :: ${itemToString(item)}` },
];

function ItemLayout({
  children,
  item,
  prev,
  next,
  wiki,
}: React.PropsWithChildren<{
  item: SlimItem & { picture: string };
  prev: SlimItem | null;
  next: SlimItem | null;
  wiki: boolean;
}>) {
  const wikiLink = `https://kol.coldfront.net/thekolwiki/index.php/${itemToString(item)}`;

  return (
    <Layout>
      <Stack alignSelf="stretch">
        <Stack direction="row" gap={6} justifyContent="center">
          <Image
            src={`https://s3.amazonaws.com/images.kingdomofloathing.com/itemimages/${item.picture}.gif`}
            alt={itemToString(item)}
            filter={{ _dark: "invert(1)" }}
          />

          <Heading
            as="h2"
            size="4xl"
            dangerouslySetInnerHTML={{ __html: item.name }}
          />
        </Stack>
        <Stack direction="row" justifyContent="space-between">
          <IconButton disabled={!prev} asChild>
            <RRLink
              to={prev ? `/item/${prev.itemid}` : "."}
              title={
                prev
                  ? `Previous item (${itemToString(prev)})`
                  : "No previous item"
              }
            >
              <LuArrowLeft />
            </RRLink>
          </IconButton>
          <Stack direction="row">
            <Button asChild>
              <RRLink to="/">
                <LuHouse />
                home
              </RRLink>
            </Button>
            {wiki && (
              <Button asChild>
                <RRLink to={wikiLink} target="_blank" rel="noopener noreferrer">
                  <img
                    src="/coldfront.png"
                    alt="Wiki link"
                    style={{ width: "1em", verticalAlign: "middle" }}
                  />
                  wiki
                </RRLink>
              </Button>
            )}
          </Stack>
          <IconButton
            disabled={!next}
            asChild
            title={next ? `Next item (${itemToString(next)})` : "No next item"}
          >
            <RRLink to={next ? `/item/${next.itemid}` : "."}>
              <LuArrowRight />
            </RRLink>
          </IconButton>
        </Stack>
      </Stack>

      {children}
    </Layout>
  );
}

export default function Item() {
  const { item, prev, next } = useLoaderData<typeof loader>();

  return (
    <ItemLayout wiki={true} item={item} prev={prev} next={next}>
      <ItemDescription description={item.description} />
      <ItemPageRanking collections={item.collections} />
    </ItemLayout>
  );
}
