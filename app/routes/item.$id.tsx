import { Button, Group, HStack, Heading, Image, Stack } from "@chakra-ui/react";
import { LuArrowLeft } from "react-icons/lu";
import {
  type LoaderFunctionArgs,
  type MetaFunction,
  Link as RRLink,
  useLoaderData,
} from "react-router";

import ItemDescription from "~/components/ItemDescription";
import ItemPageRanking from "~/components/ItemPageRanking";
import Layout from "~/components/Layout";
import { itemToString } from "~/utils";
import { HttpError, type SlimItem, loadCollections } from "~/utils.server";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const id = Number(params.id);
  try {
    return await loadCollections(id);
  } catch (error) {
    if (error instanceof HttpError) throw error.toRouteError();
    throw error;
  }
};

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
  const wikiLink = `https://kol.coldfront.net/thekolwiki/index.php/${itemToString(item)}`;

  return (
    <Layout>
      <Stack>
        <HStack gap={6} justifyContent="center">
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
        </HStack>
        <Group justifyContent="center">
          <Button asChild>
            <RRLink to="/">
              <LuArrowLeft />
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
        </Group>
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

// export function ErrorBoundary() {
//   const error = useRouteError();

//   console.log(error);

//   if (!isRouteErrorResponse(error)) return "Unexpected error";

//   const item = {
//     itemid: -1,
//     name: "Not Found",
//     picture: "nopic",
//     ambiguous: false,
//   };

//   return (
//     <ItemLayout item={item} wiki={false}>
//       <Text>{error.data}</Text>
//     </ItemLayout>
//   );
// }
