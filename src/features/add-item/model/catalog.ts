import { content, tr } from '@/shared/content/content';
import { COIN } from '../config/constants';
import type { Entry } from './types';

export const EQUIPMENT: Entry[] = content.equipment
  .map((e) => ({ id: e.id, name: tr(e.name).text, note: `${e.cost.amount} ${COIN[e.cost.unit] ?? e.cost.unit}` }))
  .sort((a, b) => a.name.localeCompare(b.name, 'ru'));

export const MAGIC: Entry[] = content.magicItems
  .map((m) => ({ id: m.id, name: tr(m.name).text, note: tr(m.rarity).text }))
  .sort((a, b) => a.name.localeCompare(b.name, 'ru'));
