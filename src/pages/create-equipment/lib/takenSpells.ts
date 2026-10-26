import type { Character } from '@/entities/character';
import { CHOICE_KEYS, magicInitiateSlots } from '@/entities/character';
import { content } from '@/shared/content';
import { t } from '@/shared/i18n';

import { CLASS_CANTRIPS, CLASS_SPELLS } from '../config/constants';

/**
 * Заклинания, уже выбранные в других разделах шага, — второй раз их выбрать нельзя
 * (заговор класса и тот же заговор от черты ничего не дают).
 */
export function takenSpells(c: Character, section: string): Map<string, string> {
  const sections: [string, string[]][] = [
    [CLASS_CANTRIPS, c.cantrips],
    [CLASS_SPELLS, c.preparedSpells],
  ];
  for (const { slot } of magicInitiateSlots(c, content)) {
    for (const key of [CHOICE_KEYS.featCantrips(slot), CHOICE_KEYS.featSpell(slot)]) {
      sections.push([key, c.choices[key] ?? []]);
    }
  }
  const taken = new Map<string, string>();
  for (const [key, ids] of sections) {
    if (key !== section) {
      for (const id of ids) {
        taken.set(id, t('equipmentStep.taken'));
      }
    }
  }
  return taken;
}
