import { t } from '@/shared/i18n';

import { localizeText } from './content';
import { plain } from './plain';
import type { Spell } from './types';

/** Краткая строка о заклинании: «1 круг · Действие · 60 фт · Мгновенная». */
export function spellMeta(s: Spell): string {
  return [
    s.level === 0 ? t('spell.cantrip') : t('spell.circle', { level: s.level }),
    localizeText(s.castingTime).text,
    localizeText(s.range).text,
    localizeText(s.duration).text,
  ]
    .filter(Boolean)
    .join(' · ');
}

/** Полное описание заклинания: текст и усиление на более высоких кругах. */
export function spellDescription(s: Spell): string {
  return [plain(s.description), plain(s.higherLevel)].filter(Boolean).join('\n\n');
}
