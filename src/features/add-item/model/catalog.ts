import type { Coin } from '@/shared/content';
import { COIN_ABBR, content, tr } from '@/shared/content';
import type { Entry } from './types';

export const EQUIPMENT: Entry[] = content.equipment
  .map((e) => ({ id: e.id, name: tr(e.name).text, note: `${e.cost.amount} ${COIN_ABBR[e.cost.unit as Coin] ?? e.cost.unit}` }))
  .sort((a, b) => a.name.localeCompare(b.name, 'ru'));

export const MAGIC: Entry[] = content.magicItems
  .map((m) => ({ id: m.id, name: tr(m.name).text, note: tr(m.rarity).text }))
  .sort((a, b) => a.name.localeCompare(b.name, 'ru'));
