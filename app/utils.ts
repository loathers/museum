import { decodeHTML } from "entities";

export const HOLDER_ID = 216194;

export const pluralise = (item: { plural?: string | null; name: string }) => {
  return item.plural || item.name + "s";
};

export function englishJoin(elements: React.ReactNode[]) {
  if (elements.length === 0) return null;
  if (elements.length === 1) return elements[0];
  return elements.map((el, i) => [
    i === 0 ? null : i === elements.length - 1 ? " and " : ", ",
    el,
  ]);
}

export type SlimItem = { itemid: number; name: string; ambiguous: boolean };

export function itemToString(
  item: SlimItem | null | undefined,
  disambiguate = false,
  usePlural = false,
) {
  return item
    ? `${item.ambiguous && disambiguate ? `[${item.itemid}]` : ""}${decodeHTML(
        usePlural ? pluralise(item) : item.name,
      ).replace(/(<([^>]+)>)/gi, "")}`
    : "";
}
