import { byId, proficiencyName } from '@/shared/content';

import type { CharacterSheet } from '../model/types';

/** Владения персонажа по группам (названия на текущем языке): доспехи, оружие, инструменты. */
export function proficiencyGroups(sheet: CharacterSheet): { armor: string[]; weapons: string[]; tools: string[] } {
  const of = (...types: string[]) =>
    sheet.proficiencies.filter((id) => types.includes(byId.proficiencies.get(id)?.type ?? '')).map(proficiencyName);
  return { armor: of('armor'), weapons: of('weapon'), tools: of('tool', 'artisanTool', 'instrument', 'other') };
}
