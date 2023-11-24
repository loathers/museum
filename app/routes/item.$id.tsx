import {
  ButtonGroup,
  Heading,
  HStack,
  Image,
  Stack,
  Text,
} from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";

import ItemDescription from "~/components/ItemDescription";
import ItemPageRanking from "~/components/ItemPageRanking";
import Layout from "~/components/Layout";
import type { SlimItem } from "~/utils";
import {
  HttpError,
  itemToString,
  ITEM_NOT_FOUND_ERROR,
  loadCollections,
} from "~/utils";
import ButtonLink from "~/components/ButtonLink";

export async function loader({ params }: LoaderFunctionArgs) {
  const id = Number(params.id);
  try {
    const collections = await loadCollections(id);
    if (collections.collections.length === 0) throw ITEM_NOT_FOUND_ERROR;
    return json(collections);
  } catch (error) {
    if (error instanceof HttpError) throw error.toRouteError();
    throw error;
  }
}

export const meta: MetaFunction<typeof loader> = ({ data: item }) => [
  { title: `Museum :: ${itemToString(item)}` },
];

function ItemLayout({
  children,
  item,
  wiki,
}: React.PropsWithChildren<{
  item: SlimItem & { picture: string };
  wiki: boolean;
}>) {
  return (
    <Layout>
      <Stack>
        <HStack spacing={6} justifyContent="center">
          <Image
            src={`https://s3.amazonaws.com/images.kingdomofloathing.com/itemimages/${item.picture}.gif`}
            alt={itemToString(item)}
          />

          <Heading dangerouslySetInnerHTML={{ __html: item.name }} />
        </HStack>
        <ButtonGroup justifyContent="center">
          <ButtonLink leftIcon={<>←</>} to="/">
            home
          </ButtonLink>
          {wiki && (
            <ButtonLink
              to={`https://kol.coldfront.net/thekolwiki/index.php/${itemToString(
                item,
              )}`}
              leftIcon={
                <img
                  src="/coldfront.png"
                  alt="Wiki link"
                  style={{ width: "1em", verticalAlign: "middle" }}
                />
              }
              rightIcon={<ExternalLinkIcon />}
            >
              wiki
            </ButtonLink>
          )}
        </ButtonGroup>
      </Stack>

      {children}
    </Layout>
  );
}

export default function Item() {
  const item = useLoaderData<typeof loader>();

  return (
    <ItemLayout wiki={true} item={item}>
      <ItemDescription description={item.description} />
      <ItemPageRanking collections={item.collections} />
    </ItemLayout>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (!isRouteErrorResponse(error)) return "Unexpected error";

  const item = {
    itemid: -1,
    name: "Not Found",
    picture: "nopic",
    ambiguous: false,
  };

  return (
    <ItemLayout item={item} wiki={false}>
      <Text>{error.data}</Text>
    </ItemLayout>
  );
}
