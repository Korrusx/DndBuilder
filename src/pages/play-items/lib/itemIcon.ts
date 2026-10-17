import type { Equipment } from '@/shared/content';
import type { GameIconName } from '@/shared/ui/GameIcon/GameIcon.types';

const AXE_IDS = new Set(['battleaxe', 'greataxe', 'handaxe']);
const BOW_IDS = new Set(['longbow', 'shortbow', 'hand-crossbow', 'light-crossbow', 'heavy-crossbow']);
const STAFF_IDS = new Set(['quarterstaff', 'staff']);
const DAGGER_IDS = new Set(['dagger']);

export function itemIcon(item: Equipment | undefined): GameIconName {
  if (!item) return 'warlock-eye';
  if (item.weapon) {
    if (AXE_IDS.has(item.id)) return 'battle-axe';
    if (BOW_IDS.has(item.id)) return 'bowman';
    if (DAGGER_IDS.has(item.id)) return 'cloak-dagger';
    if (STAFF_IDS.has(item.id)) return 'wizard-staff';
    return 'crossed-swords';
  }
  if (item.armor) {
    return item.armor.category === 'shield' ? 'templar-shield' : 'person';
  }
  return 'person';
}

export type ItemCategory = 'weapon' | 'armor' | 'other';

export function itemCategory(item: Equipment | undefined): ItemCategory {
  if (!item) return 'other';
  if (item.weapon) return 'weapon';
  if (item.armor) return 'armor';
  return 'other';
}
