import type { Equipment, MagicItem } from '@/shared/content';
import type { GameIconName } from '@/shared/ui';
import type { SlotId } from '@/entities/character';

const AXE_IDS = new Set(['battleaxe', 'greataxe', 'handaxe']);
const BOW_IDS = new Set(['longbow', 'shortbow', 'hand-crossbow', 'light-crossbow', 'heavy-crossbow']);
const STAFF_IDS = new Set(['quarterstaff', 'staff']);
const DAGGER_IDS = new Set(['dagger']);

export function itemIcon(eq: Equipment | MagicItem | undefined): GameIconName {
  if (!eq) {
    return 'person';
  }
  const e = eq as Equipment;
  if (e.weapon) {
    if (AXE_IDS.has(e.id)) {
      return 'battle-axe';
    }
    if (BOW_IDS.has(e.id)) {
      return 'bowman';
    }
    if (DAGGER_IDS.has(e.id)) {
      return 'cloak-dagger';
    }
    if (STAFF_IDS.has(e.id)) {
      return 'wizard-staff';
    }
    return 'crossed-swords';
  }
  if (e.armor) {
    return e.armor.category === 'shield' ? 'templar-shield' : 'person';
  }
  const m = eq as MagicItem;
  const k = m.kind?.en?.toLowerCase() ?? '';
  if (k.includes('ring')) {
    return 'holy-symbol';
  }
  if (k.includes('cloak') || k.includes('cape')) {
    return 'cloak-dagger';
  }
  if (k.includes('boot') || k.includes('shoe')) {
    return 'person';
  }
  if (k.includes('amulet') || k.includes('necklace') || k.includes('pendant')) {
    return 'holy-symbol';
  }
  if (k.includes('wand') || k.includes('staff') || k.includes('rod')) {
    return 'wizard-staff';
  }
  return 'warlock-eye';
}

export const SLOT_ICONS: Record<SlotId, GameIconName> = {
  head: 'person',
  shoulders: 'cloak-dagger',
  body: 'person',
  hands: 'person',
  feet: 'person',
  neck: 'holy-symbol',
  wrists: 'person',
  belt: 'person',
  ring1: 'holy-symbol',
  ring2: 'holy-symbol',
  main: 'crossed-swords',
  off: 'templar-shield',
  ranged: 'bowman',
};
