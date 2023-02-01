export const plural = (item: { plural: string | null, name: string }) => {
    return item.plural || item.name + "s";
}

export function englishJoin(elements: React.ReactNode[]) {
  if (elements.length === 0) return null;
  if (elements.length === 1) return elements[0];
  return elements.map((el, i) => [
    i === 0 ? null : i === elements.length - 1 ? " and " : ", ",
    el,
  ]);
}
