// Поиск карточек по имени: без учёта регистра и разницы ё/е, сначала совпадения с начала имени.

import type { Entity } from './types';

export const foldText = (text: string) => text.toLocaleLowerCase('ru').replace(/ё/g, 'е').trim();

/** 0 — имя начинается с запроса, 1 — одно из слов, 2 — просто содержит, null — не подходит. */
function rank(name: string, query: string): number | null {
  const folded = foldText(name);
  if (folded.startsWith(query)) {
    return 0;
  }
  if (folded.split(/[\s«»"'()-]+/).some((word) => word.startsWith(query))) {
    return 1;
  }
  return folded.includes(query) ? 2 : null;
}

export function searchEntities(query: string, entities: Entity[]): Entity[] {
  const folded = foldText(query);
  if (!folded) {
    return [...entities].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }
  return entities
    .map((entity) => ({ entity, rank: rank(entity.name, folded) }))
    .filter((hit): hit is { entity: Entity; rank: number } => hit.rank !== null)
    .sort((a, b) => a.rank - b.rank || a.entity.name.localeCompare(b.entity.name, 'ru'))
    .map((hit) => hit.entity);
}
