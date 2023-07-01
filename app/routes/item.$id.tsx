import { Container, Heading, HStack, Image, Link, Stack } from "@chakra-ui/react";
import type { LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { isRouteErrorResponse, Link as RemixLink, useLoaderData, useRouteError } from "@remix-run/react";

import ItemDescription from "~/components/ItemDescription";
import ItemPageRanking from "~/components/ItemPageRanking";
import { HttpError, itemToString, ITEM_NOT_FOUND_ERROR, loadCollections } from "~/utils";

export async function loader({ params }: LoaderArgs) {
  const id = Number(params.id);
  try {
    const collections = await loadCollections(id);
    if (collections.collection.length === 0) throw ITEM_NOT_FOUND_ERROR;
    return json(collections);
  } catch (error) {
    if (error instanceof HttpError) throw error.toRouteError();
    throw error;
  }
}

export const meta: V2_MetaFunction<typeof loader> = ({ data: item }) => [
  { title: `Museum :: ${itemToString(item)}` }
];

export default function Item() {
  const item = useLoaderData<typeof loader>();

  return (
    <Container>
      <Stack alignItems="center">
        <HStack spacing={6}>
          <Image
            src={`https://s3.amazonaws.com/images.kingdomofloathing.com/itemimages/${item.picture}.gif`}
            alt={itemToString(item)}
          />

          <Heading as="h2" dangerouslySetInnerHTML={{ __html: item.name }} />
        </HStack>
        <HStack>
          <Link as={RemixLink} to="/">
            [← home]
          </Link>
          <HStack
          spacing={0}
            as={RemixLink}
            to={`https://kol.coldfront.net/thekolwiki/index.php/${itemToString(
              item
            )}`}
          >
            <span>[</span>
            <img
              src="/coldfront.png"
              alt="Wiki link"
              style={{ width: "1em", verticalAlign: "middle" }}
            />
            <span>&nbsp;wiki]</span>
          </HStack>
        </HStack>

        <ItemDescription description={item.description} />

        <ItemPageRanking collections={item.collection} />
      </Stack>
    </Container>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (!isRouteErrorResponse(error)) return "Unexpected error";

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
          src={`https://s3.amazonaws.com/images.kingdomofloathing.com/itemimages/nopic.gif`}
          alt="Error"
          style={{ marginRight: "0.7em" }}
        />

        <h2>{error.statusText || error.data}</h2>
      </div>

      <div style={{ marginBottom: 20 }}>
        <Link as={RemixLink} to="/">[← home]</Link>
      </div>

      <div>
        {error.data}
      </div>
    </div>
  );
}