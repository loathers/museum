export function chunkify<T>(items: T[], size: number) {
  return Array.from(
    { length: Math.ceil(items.length / size) },
    (_: T, i: number) => items.slice(i * size, (i + 1) * size),
  );
}

export function notNull<T>(value: T | null): value is T {
  return value !== null;
}
