// Доступ к справочнику. Файл assets/content/content.json собирается командой `npm run data:build`.

export const HOMEBREW_EQUIPMENT_PREFIX = 'homebrew-eq-';

import { currentLanguage } from '@/shared/i18n';

import data from '../../../assets/content/content.json';
import type { Content, ContentIndex, Edition, LocalizedText } from './types';

export type * from './types';

const content2024 = data as unknown as Content;
let content2014: Content | undefined;

/**
 * Справочник редакции. 2014 (SRD 5.1, assets/content/content-2014.json, `npm run data:build:2014`)
 * загружается при первом обращении, чтобы не замедлять запуск тем, кто играет только по 2024.
 */
export function contentFor(edition: Edition): Content {
  if (edition === '2024') return content2024;
  content2014 ??= require('../../../assets/content/content-2014.json') as Content;
  return content2014;
}

const indexCache = new WeakMap<Content, ContentIndex>();

/** Таблицы для быстрого поиска по id. Строятся один раз на каждый справочник (в тестах их бывает несколько). */
export function indexOf(c: Content): ContentIndex {
  let idx = indexCache.get(c);
  if (!idx) {
    const entries = Object.entries(c).filter(([, v]) => Array.isArray(v)) as [string, { id: string }[]][];
    idx = Object.fromEntries(entries.map(([key, items]) => [key, new Map(items.map((x) => [x.id, x]))])) as unknown as ContentIndex;
    indexCache.set(c, idx);
  }
  return idx;
}

// ---------- Активная редакция ----------
// Экраны одного персонажа (мастер создания, режим игры) берут справочник его редакции через `content` и `byId`.
// Провайдер персонажа переключает их (useActiveEdition); вне персонажа — 2024. Экраны, где персонажей несколько
// (список), берут справочник каждого явно: contentFor(c.edition).

/** Справочник активной редакции (по умолчанию 2024). Значение меняется при переключении редакции. */
export let content: Content = content2024;

/** Таблицы поиска по id для активного справочника. */
export let byId: ContentIndex = indexOf(content2024);

let active: { edition: Edition; owner: symbol | null } = { edition: '2024', owner: null };

export function activeEdition(): Edition {
  return active.edition;
}

/** Переключает активную редакцию. `owner` — кто переключил: вернуть 2024 может только он (releaseEdition). */
export function setActiveEdition(edition: Edition, owner: symbol | null = null) {
  active = { edition, owner };
  if (content.edition === edition) return;
  content = contentFor(edition);
  byId = indexOf(content);
}

/** Возвращает 2024, если редакцию последним переключал `owner` (провайдер закрылся, а другой ещё не открылся). */
export function releaseEdition(owner: symbol) {
  if (active.owner === owner) setActiveEdition('2024');
}

/**
 * Текст для показа на текущем языке. Если текста на этом языке нет — текст на другом языке
 * с флагом `translated: false` (для пометки).
 */
export function tr(text: LocalizedText | undefined): { text: string; translated: boolean } {
  if (!text) return { text: '', translated: true };
  if (currentLanguage() === 'en') return text.en ? { text: text.en, translated: true } : { text: text.ru ?? '', translated: false };
  return text.ru ? { text: text.ru, translated: true } : { text: text.en, translated: false };
}

/**
 * Вталкивает хоумбрю-предметы в справочник так, чтобы byId.equipment их видел.
 * Идемпотентно: повторная вставка одного id игнорируется.
 */
type MutableEquipmentMap = Map<string, import('./types').Equipment>;

function eqMap(c: Content): MutableEquipmentMap {
  return indexOf(c).equipment as unknown as MutableEquipmentMap;
}

export function injectHomebrew(equipment: import('./types').Equipment[]): void {
  for (const e of equipment) {
    if (eqMap(content2024).has(e.id)) continue;
    content2024.equipment.push(e);
    eqMap(content2024).set(e.id, e);
    if (content2014) {
      content2014.equipment.push(e);
      eqMap(content2014).set(e.id, e);
    }
  }
}

/** Обновляет один хоумбрю-предмет в индексе (после редактирования). */
export function updateHombrewItem(e: import('./types').Equipment): void {
  const map24 = eqMap(content2024);
  if (!map24.has(e.id)) return;
  map24.set(e.id, e);
  const i24 = content2024.equipment.findIndex((x) => x.id === e.id);
  if (i24 >= 0) content2024.equipment[i24] = e;
  if (content2014) {
    eqMap(content2014).set(e.id, e);
    const i14 = content2014.equipment.findIndex((x) => x.id === e.id);
    if (i14 >= 0) content2014.equipment[i14] = e;
  }
}

/** Удаляет хоумбрю-предмет из индекса (после удаления из БД). */
export function removeHombrewItem(id: string): void {
  eqMap(content2024).delete(id);
  const i24 = content2024.equipment.findIndex((x) => x.id === id);
  if (i24 >= 0) content2024.equipment.splice(i24, 1);
  if (content2014) {
    eqMap(content2014).delete(id);
    const i14 = content2014.equipment.findIndex((x) => x.id === id);
    if (i14 >= 0) content2014.equipment.splice(i14, 1);
  }
}

/** Доля переведённых текстов справочника (для страницы «О приложении»). */
export function translationProgress(c: Content): { done: number; total: number } {
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
  walk(c);
  return { done, total };
}
