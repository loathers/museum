import { Route } from "./+types/api.item.$id";
import { HttpError, loadCollections } from "~/utils.server";

export type LoaderReturnType = Awaited<ReturnType<typeof loadCollections>>;

export async function loader({ params }: Route.LoaderArgs) {
  const id = Number(params.id);

  try {
    return Response.json(await loadCollections(id, 10));
  } catch (error) {
    if (error instanceof HttpError) throw error.toRouteError();
    throw error;
  }
}
