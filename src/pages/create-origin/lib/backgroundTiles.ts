import type { Background } from '@/shared/content';
import { abilityAbbr, byId, proficiencyName } from '@/shared/content';

/** Строка плитки предыстории: 2024 — три характеристики («ЛОВ · ТЕЛ · ИНТ»), 2014 — навыки. */
export function backgroundTileLine(background: Background): string {
  if (background.abilities.length) {
    return background.abilities.map(abilityAbbr).join(' · ');
  }
  return background.proficiencies
    .filter((id) => byId.proficiencies.get(id)?.type === 'skill')
    .map(proficiencyName)
    .join(' · ');
}
