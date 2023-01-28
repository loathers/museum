export const plural = (item: { plural: string | null, name: string }) => {
    return item.plural || item.name + "s";
}