import { nameOf } from '@/shared/content';

import type { Character } from '../model/types';

/** «Плут 5 · Полурослик · Преступник» — подзаголовок персонажа для карточек и заголовков. */
export function characterSubtitle(character: Character): string {
  const classes = character.classes.map((entry) => `${nameOf('classes', entry.classId)} ${entry.level}`).join(' / ');
  return [classes, nameOf('species', character.speciesId), nameOf('backgrounds', character.backgroundId)]
    .filter(Boolean)
    .join(' · ');
}
