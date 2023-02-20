import type { LoaderArgs } from "@remix-run/node";
import { loadCollections } from "./item.$id";

export async function loader({ params }: LoaderArgs) {
  const id = Number(params.id);

  return await loadCollections(id, 10);
}
