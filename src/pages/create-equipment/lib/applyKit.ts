import type { Character } from '@/entities/character';
import { startingKit } from '@/entities/character';
import { content } from '@/shared/content';

/** Записывает выбранные наборы в инвентарь и кошелёк. */
export function applyKit(c: Character): Character {
  const kit = startingKit(c, content);
  return { ...c, equipment: kit.items, coins: kit.coins };
}
