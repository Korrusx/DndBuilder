// Файл обмена персонажами: экспорт (резервная копия, передача другу) и проверка файла при импорте.
// В файле — те же данные, что в базе: выборы игрока и состояние игры; все числа пересчитываются из справочника.

import type { Character } from '@/entities/character';
import { ABILITY_IDS, computeSheet, withDefaults } from '@/entities/character';
import type { Content } from '@/shared/content';
import { EXCHANGE_FORMAT, EXCHANGE_MAX_BYTES, EXCHANGE_VERSION } from '../config/constants';
import type { ExchangeFile, ImportResult } from './types';

export function buildExchange(characters: Character[], now: string, contentVersion: string): ExchangeFile {
  return { format: EXCHANGE_FORMAT, version: EXCHANGE_VERSION, exportedAt: now, contentVersion, characters };
}

/** Имя файла: «Ирма Вейл.dnd.json» для одного персонажа, «Персонажи 2026-10-11.dnd.json» для нескольких. */
export function exchangeFileName(characters: Character[], now: string): string {
  const one = characters.length === 1 ? characters[0].name.replace(/[\\/:*?"<>|\n\r\t]+/g, ' ').trim().slice(0, 60) : '';
  return `${one || `Персонажи ${now.slice(0, 10)}`}.dnd.json`;
}

export class ImportError extends Error {}

const isObject = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x);
const isStringArray = (x: unknown) => x === undefined || (Array.isArray(x) && x.every((v) => typeof v === 'string'));

/** Почему запись не похожа на персонажа (или null, если похожа). */
function shapeProblem(x: unknown): string | null {
  if (!isObject(x)) return 'это не персонаж';
  if (typeof x.name !== 'string') return 'нет имени';
  if (!Array.isArray(x.classes)) return 'нет классов';
  for (const e of x.classes) {
    if (!isObject(e) || typeof e.classId !== 'string' || typeof e.level !== 'number' || e.level < 1 || e.level > 20) {
      return 'неверные уровни класса';
    }
  }
  if (typeof x.speciesId !== 'string' || typeof x.backgroundId !== 'string') return 'нет вида или предыстории';
  if (!isObject(x.baseAbilities) || !ABILITY_IDS.every((a) => typeof (x.baseAbilities as Record<string, unknown>)[a] === 'number')) {
    return 'неверные характеристики';
  }
  for (const key of ['skillProficiencies', 'expertise', 'languages', 'toolProficiencies', 'weaponMasteries', 'cantrips', 'preparedSpells']) {
    if (!isStringArray(x[key])) return `неверное поле ${key}`;
  }
  if (x.equipment !== undefined && !Array.isArray(x.equipment)) return 'неверное снаряжение';
  if (x.feats !== undefined && !Array.isArray(x.feats)) return 'неверные черты';
  if (x.state !== undefined && !isObject(x.state)) return 'неверное состояние игры';
  return null;
}

/** id из персонажа, которых нет в справочнике: такие записи не покажутся. */
function unknownRefs(c: Character, content: Content): string[] {
  const has = (list: { id: string }[]) => {
    const ids = new Set(list.map((x) => x.id));
    return (id: string) => ids.has(id);
  };
  const spell = has(content.spells);
  const item = has([...content.equipment, ...content.magicItems]);
  const feat = has(content.feats);
  const lang = has(content.languages);
  return [
    ...[...c.cantrips, ...c.preparedSpells].filter((id) => !spell(id)),
    ...c.equipment.filter((i) => !i.itemId.startsWith('custom:') && !item(i.itemId)).map((i) => i.itemId),
    ...c.feats.map((f) => f.featId).filter((id) => !feat(id)),
    ...c.languages.filter((id) => !lang(id)),
  ];
}

/** Для сообщения об ошибке: размер и начало прочитанного, без управляющих символов. */
export function describeStart(text: string): string {
  if (!text) return 'Файл пустой.';
  const start = text.slice(0, 60).replace(/[\u0000-\u001f\u007f-\u009f\ufffd]/g, '·');
  return `Прочитано символов: ${text.length}. Начало: «${start}${text.length > 60 ? '…' : ''}»`;
}

/**
 * Читает файл обмена. Каждый персонаж получает новый id (существующие не затираются).
 * Персонажи, которых нельзя открыть (неизвестный класс, вид или предыстория), пропускаются с предупреждением.
 */
export function parseExchange(text: string, content: Content, makeId: () => string, now: string): ImportResult {
  if (text.length > EXCHANGE_MAX_BYTES) throw new ImportError('Файл слишком большой — это не файл персонажей.');
  // Невидимая метка порядка байтов (BOM) и пробелы по краям появляются, если файл пересохранили другим приложением.
  const body = text.replace(/^\uFEFF/, '').trim();
  if (body.startsWith('%PDF')) {
    throw new ImportError(
      'Это PDF-лист для печати — его нельзя загрузить обратно.\n\nДля переноса и резервной копии нужен файл .dnd.json: ' +
        'кнопка «Копия всех» на экране «Мои персонажи» или «Сохранить персонажа в файл» в редактировании персонажа (карандаш).',
    );
  }
  let data: unknown;
  try {
    data = JSON.parse(body);
  } catch {
    throw new ImportError(`Это не файл персонажей: не удаётся прочитать содержимое.\n\n${describeStart(body)}`);
  }
  if (!isObject(data) || data.format !== EXCHANGE_FORMAT) {
    throw new ImportError('Это не файл персонажей нашего приложения. Выберите файл с расширением .dnd.json.');
  }
  if (typeof data.version !== 'number' || data.version > EXCHANGE_VERSION) {
    throw new ImportError('Файл сделан более новой версией приложения. Обновите приложение и попробуйте снова.');
  }
  if (!Array.isArray(data.characters) || data.characters.length === 0) throw new ImportError('В файле нет персонажей.');

  const characters: Character[] = [];
  const warnings: string[] = [];
  const known = {
    classes: new Set(content.classes.map((x) => x.id)),
    subclasses: new Set(content.subclasses.map((x) => x.id)),
    species: new Set(content.species.map((x) => x.id)),
    backgrounds: new Set(content.backgrounds.map((x) => x.id)),
  };

  data.characters.forEach((raw: unknown, i: number) => {
    const label = isObject(raw) && typeof raw.name === 'string' && raw.name.trim() ? `«${raw.name.trim()}»` : `№${i + 1}`;
    const problem = shapeProblem(raw);
    if (problem) {
      warnings.push(`Персонаж ${label} пропущен: ${problem}.`);
      return;
    }
    const saved = raw as Partial<Character>;
    const createdAt = typeof saved.createdAt === 'string' ? saved.createdAt : now;
    const c = withDefaults(saved, { id: makeId(), createdAt, updatedAt: now });

    const missing = [
      ...c.classes.filter((e) => !known.classes.has(e.classId)).map((e) => `класс ${e.classId}`),
      ...c.classes.filter((e) => e.subclassId && !known.subclasses.has(e.subclassId)).map((e) => `подкласс ${e.subclassId}`),
      ...(c.speciesId && !known.species.has(c.speciesId) ? [`вид ${c.speciesId}`] : []),
      ...(c.backgroundId && !known.backgrounds.has(c.backgroundId) ? [`предыстория ${c.backgroundId}`] : []),
    ];
    if (missing.length) {
      warnings.push(`Персонаж ${label} пропущен: в справочнике нет — ${missing.join(', ')}.`);
      return;
    }
    if (c.status.kind === 'ready') {
      try {
        computeSheet(c, content);
      } catch (err) {
        warnings.push(`Персонаж ${label} пропущен: ${err instanceof Error ? err.message : 'не удаётся рассчитать лист'}.`);
        return;
      }
    }
    const unknown = unknownRefs(c, content);
    if (unknown.length) warnings.push(`У персонажа ${label} не найдено в справочнике: ${unknown.join(', ')}.`);
    characters.push(c);
  });

  if (characters.length === 0) throw new ImportError(['Ни одного персонажа не удалось загрузить.', ...warnings].join('\n'));
  return { characters, warnings };
}
