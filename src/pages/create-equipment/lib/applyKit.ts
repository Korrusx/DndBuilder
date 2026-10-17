import type { Character } from '@/entities/character';
import { startingKit } from '@/entities/character';
import { content } from '@/shared/content';

/** Записывает выбранные наборы в инвентарь и кошелёк; автоматически надевает первый доспех. */
export function applyKit(c: Character): Character {
  const kit = startingKit(c, content);
  return { ...c, equipment: kit.items, equippedSlots: kit.equippedSlots, coins: kit.coins };
}
