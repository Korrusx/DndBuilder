import { t } from '@/shared/i18n';

import { localizeText } from './content';
import type { Spell } from './types';

/** Краткая строка о заклинании: «1 круг · Действие · 60 фт · Мгновенная». */
export function spellMeta(s: Spell): string {
  return [s.level === 0 ? t('spell.cantrip') : t('spell.circle', { level: s.level }), localizeText(s.castingTime).text, localizeText(s.range).text, localizeText(s.duration).text]
    .filter(Boolean)
    .join(' · ');
}
