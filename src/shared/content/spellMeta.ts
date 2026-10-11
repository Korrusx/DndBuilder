import { tr } from './content';
import type { Spell } from './types';

/** Краткая строка о заклинании: «1 круг · Действие · 60 фт · Мгновенная». */
export function spellMeta(s: Spell): string {
  return [s.level === 0 ? 'Заговор' : `${s.level} круг`, tr(s.castingTime).text, tr(s.range).text, tr(s.duration).text]
    .filter(Boolean)
    .join(' · ');
}
