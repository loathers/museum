import { type LoaderFunctionArgs } from "react-router";
import { HttpError, loadCollections } from "~/utils.server";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const id = Number(params.id);

  try {
    const collections = await loadCollections(id, 10);
    return collections;
  } catch (error) {
    if (error instanceof HttpError) throw error.toRouteError();
    throw error;
  }
};
