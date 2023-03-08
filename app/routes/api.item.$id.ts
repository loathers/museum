import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { HTTPError, loadCollections } from "~/utils";

export async function loader({ params }: LoaderArgs) {
  const id = Number(params.id);

  try {
    const collections = await loadCollections(id, 10);
    return json(collections);
  } catch (error) {
    if (!(error instanceof HTTPError)) throw error;
    throw json(error.message, { status: error.status });
  }
}
