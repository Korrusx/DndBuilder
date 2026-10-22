import { coinAbbr, content, HOMEBREW_EQUIPMENT_PREFIX, localizeText } from '@/shared/content';
import { currentLanguage } from '@/shared/i18n';

import type { Entry } from './types';

const _eq: { lang: string; list: Entry[] } = { lang: '', list: [] };
const _mg: { lang: string; list: Entry[] } = { lang: '', list: [] };

export function equipmentCatalog(): Entry[] {
  const lang = currentLanguage();
  if (_eq.lang === lang && _eq.list.length > 0) {
    return _eq.list;
  }
  _eq.list = content.equipment
    .map((e) => ({
      id: e.id,
      name: localizeText(e.name).text,
      note: e.id.startsWith(HOMEBREW_EQUIPMENT_PREFIX) ? '★' : `${e.cost.amount} ${coinAbbr(e.cost.unit)}`,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, lang));
  _eq.lang = lang;
  return _eq.list;
}

export function magicCatalog(): Entry[] {
  const lang = currentLanguage();
  if (_mg.lang === lang && _mg.list.length > 0) {
    return _mg.list;
  }
  _mg.list = content.magicItems
    .map((m) => ({ id: m.id, name: localizeText(m.name).text, note: localizeText(m.rarity).text }))
    .sort((a, b) => a.name.localeCompare(b.name, lang));
  _mg.lang = lang;
  return _mg.list;
}

export function warmCatalogCache(): void {
  equipmentCatalog();
  magicCatalog();
}
