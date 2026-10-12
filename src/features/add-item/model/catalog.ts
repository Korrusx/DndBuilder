import { coinAbbr, content, tr } from '@/shared/content';
import { currentLanguage } from '@/shared/i18n/model';

import type { Entry } from './types';

// Каталоги строятся на текущем языке: названия и порядок сортировки зависят от него.

export function equipmentCatalog(): Entry[] {
  return content.equipment
    .map((e) => ({ id: e.id, name: tr(e.name).text, note: `${e.cost.amount} ${coinAbbr(e.cost.unit)}` }))
    .sort((a, b) => a.name.localeCompare(b.name, currentLanguage()));
}

export function magicCatalog(): Entry[] {
  return content.magicItems
    .map((m) => ({ id: m.id, name: tr(m.name).text, note: tr(m.rarity).text }))
    .sort((a, b) => a.name.localeCompare(b.name, currentLanguage()));
}
