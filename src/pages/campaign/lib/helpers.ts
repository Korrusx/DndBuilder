import type { Character } from '@/entities/character';
import { totalLevel } from '@/entities/character';
import { nameOf } from '@/shared/content';
import { currentLanguage } from '@/shared/i18n';

/** «Ирма · плут 5». */
export function heroLabel(character: Character): string {
  const mainClass = character.classes[0];
  if (!mainClass) {
    return character.name;
  }
  const className = nameOf('classes', mainClass.classId).toLocaleLowerCase(currentLanguage());
  return `${character.name} · ${className} ${totalLevel(character.classes)}`;
}

export const firstLetter = (name: string) => name.trim().charAt(0).toLocaleUpperCase() || '?';
