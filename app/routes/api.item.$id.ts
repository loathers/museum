import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { HttpError, loadCollections } from "~/utils";

export async function loader({ params }: LoaderArgs) {
  const id = Number(params.id);

  try {
    const collections = await loadCollections(id, 10);
    return json(collections);
  } catch (error) {
    if (error instanceof HttpError) throw error.toRouteError();
    throw error;
  }
}
