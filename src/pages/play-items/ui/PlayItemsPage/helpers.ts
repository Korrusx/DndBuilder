import { computeSheet, fitsSlot } from '@/entities/character';
import type { Character, SlotId } from '@/entities/character';
import { byId, contentFor } from '@/shared/content';
import type { Equipment, MagicItem } from '@/shared/content';
import { colors, rarityColors } from '@/shared/config';

import { ALL_SLOT_IDS } from './constants';
import { styles } from './PlayItemsPage.styles';

export function rarityColor(rarity: string | undefined): string {
  if (!rarity) {
    return colors.iconMuted;
  }
  return rarityColors[rarity.toLowerCase()] ?? colors.iconMuted;
}

export function lookupItem(itemId: string): Equipment | MagicItem | undefined {
  return (
    (byId.equipment.get(itemId) as Equipment | undefined) ?? (byId.magicItems.get(itemId) as MagicItem | undefined)
  );
}

export function isMagicItem(item: Equipment | MagicItem): item is MagicItem {
  return 'attunement' in item;
}

export function isTwoHandedWeapon(itemId: string): boolean {
  const item = lookupItem(itemId) as Equipment | undefined;
  return !!item?.weapon?.properties?.includes('two-handed');
}

export function allSlotsForItem(item: Equipment | MagicItem): SlotId[] {
  return ALL_SLOT_IDS.filter((slotId) => fitsSlot(item, slotId));
}

export function countAttuned(equippedSlots: Partial<Record<string, string>>): number {
  return Object.values(equippedSlots).filter((id) => {
    if (!id) {
      return false;
    }
    const item = lookupItem(id);
    return item ? isMagicItem(item) && item.attunement : false;
  }).length;
}

export function fmtHit(n: number): string {
  return (n >= 0 ? '+' : '') + n;
}

export function fmtDelta(delta: number): string {
  return delta > 0 ? `+${delta}` : delta < 0 ? String(delta) : '±0';
}

export function deltaStyle(delta: number) {
  return delta > 0 ? styles.deltaUp : delta < 0 ? styles.deltaDown : styles.deltaEq;
}

export function calcHypoAc(
  slotId: SlotId,
  itemId: string,
  character: Character,
  equippedSlots: Partial<Record<string, string>>,
  fallback: number,
): number {
  try {
    const slots = { ...equippedSlots, [slotId]: itemId };
    return computeSheet({ ...character, equippedSlots: slots }, contentFor(character.edition)).armorClass;
  } catch {
    return fallback;
  }
}
