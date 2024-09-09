import { unstable_defineLoader as defineLoader } from "@remix-run/node";
import { HttpError, loadCollections } from "~/utils.server";

export const loader = defineLoader(async ({ params }) => {
  const id = Number(params.id);

  try {
    const collections = await loadCollections(id, 10);
    return collections;
  } catch (error) {
    if (error instanceof HttpError) throw error.toRouteError();
    throw error;
  }
});
