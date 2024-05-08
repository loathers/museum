import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { HttpError, loadCollections } from "~/utils.server";

export async function loader({ params }: LoaderFunctionArgs) {
  const id = Number(params.id);

  try {
    const collections = await loadCollections(id, 10);
    return json(collections);
  } catch (error) {
    if (error instanceof HttpError) throw error.toRouteError();
    throw error;
  }
}
