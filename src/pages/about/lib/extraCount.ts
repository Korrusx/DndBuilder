export function extraCount(items: { extra?: boolean }[]): number {
  return items.filter((item) => item.extra).length;
}
