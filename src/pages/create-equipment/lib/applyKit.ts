import { startingKit } from '@/entities/character/model/build';
import type { Character } from '@/entities/character/model/types';
import { content } from '@/shared/content/content';

/** Записывает выбранные наборы в инвентарь и кошелёк. */
export function applyKit(c: Character): Character {
  const kit = startingKit(c, content);
  return { ...c, equipment: kit.items, coins: kit.coins };
}
