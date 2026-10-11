// Доступ к справочнику. Файл assets/content/content.json собирается командой `npm run data:build`.

import data from '../../../assets/content/content.json';
import type { Content, LocalizedText } from './types';

export type * from './types';

export const content = data as unknown as Content;

/** Быстрый поиск записи по id. */
function indexById<T extends { id: string }>(items: T[]): ReadonlyMap<string, T> {
  return new Map(items.map((x) => [x.id, x]));
}

export const byId = {
  abilities: indexById(content.abilities),
  skills: indexById(content.skills),
  proficiencies: indexById(content.proficiencies),
  classes: indexById(content.classes),
  features: indexById(content.features),
  weaponMasteries: indexById(content.weaponMasteries),
  damageTypes: indexById(content.damageTypes),
  subclasses: indexById(content.subclasses),
  species: indexById(content.species),
  subspecies: indexById(content.subspecies),
  traits: indexById(content.traits),
  backgrounds: indexById(content.backgrounds),
  feats: indexById(content.feats),
  equipment: indexById(content.equipment),
  equipmentCategories: indexById(content.equipmentCategories),
  spells: indexById(content.spells),
  magicItems: indexById(content.magicItems),
  conditions: indexById(content.conditions),
  languages: indexById(content.languages),
};

/** Текст для показа: русский, а если перевода нет — английский с флагом `translated: false`. */
export function tr(text: LocalizedText | undefined): { text: string; translated: boolean } {
  if (!text) return { text: '', translated: true };
  return text.ru ? { text: text.ru, translated: true } : { text: text.en, translated: false };
}

/** Доля переведённых текстов (для страницы «О приложении»). */
export function translationProgress(): { done: number; total: number } {
  let done = 0;
  let total = 0;
  const walk = (v: unknown) => {
    if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === 'object') {
      if ('en' in v && typeof (v as LocalizedText).en === 'string') {
        total++;
        if ((v as LocalizedText).ru) done++;
      } else Object.values(v).forEach(walk);
    }
  };
  walk(content);
  return { done, total };
}
