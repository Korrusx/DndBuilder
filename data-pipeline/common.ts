// Общее для сборки справочника обеих редакций (build.ts — 2024, build-2014.ts — 2014):
// ключи перевода и CSV, чтение сырых данных, выборы API, проверка ссылок, запись файла.
// Редакция берётся из аргумента командной строки: `node build.ts` (2024) или `node build-2014.ts` (2014).

import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import type {
  AbilityId,
  Choice,
  ChoiceOption,
  Coin,
  Content,
  LocalizedText,
  ProficiencyType,
  Spell,
  SpellAreaShape,
} from '../src/shared/content/types.ts';
import { parseCsv, stringifyCsv } from './csv.ts';

export type Edition = '2014' | '2024';

export const ROOT = dirname(fileURLToPath(import.meta.url));

/** Папки и файлы редакции: сырые данные, перевод, отчёт о непереведённом, готовый справочник. */
export function editionPaths(edition: Edition) {
  const suffix = edition === '2014' ? '-2014' : '';
  return {
    raw: join(ROOT, `raw${suffix}`),
    translations: join(ROOT, `translations${suffix}`),
    report: join(ROOT, `missing-translations${suffix}.txt`),
    out: join(ROOT, '..', 'assets', 'content', `content${suffix}.json`),
  };
}

let paths = editionPaths('2024');
let edition: Edition = '2024';

/** Выбирает редакцию для всех функций этого модуля. Вызывается один раз в начале сборки. */
export function useEdition(e: Edition) {
  edition = e;
  paths = editionPaths(e);
}

export const warnings: string[] = [];
export const warn = (msg: string) => warnings.push(msg);

// ---------------------------------------------------------------------------
// Переводы
// ---------------------------------------------------------------------------

/** В какой CSV-файл попадает ключ — по первой части ключа. */
export const FILE_BY_PREFIX: Record<string, string> = {
  ability: 'core',
  skill: 'core',
  alignment: 'core',
  language: 'core',
  condition: 'core',
  damageType: 'core',
  magicSchool: 'core',
  proficiency: 'core',
  class: 'classes',
  feature: 'classes',
  subclass: 'classes',
  species: 'origins',
  subspecies: 'origins',
  trait: 'origins',
  resource: 'classes',
  classOption: 'classes',
  background: 'origins',
  feat: 'origins',
  equipment: 'equipment',
  equipmentCategory: 'equipment',
  weaponProperty: 'equipment',
  weaponMastery: 'equipment',
  spell: 'spells',
  spellText: 'spells',
  magicItem: 'magic-items',
  magicItemText: 'magic-items',
};

type TextEntry = { en: string; file: string; targets: LocalizedText[] };
const texts = new Map<string, TextEntry>();
/** Готовый русский текст из data-pipeline/extra: попадает в CSV как черновик, если перевода там ещё нет. */
export const ruSeeds = new Map<string, string>();

/** Регистрирует текст под ключом перевода и возвращает объект, куда позже подставится `ru`. */
export function tx(key: string, en: string): LocalizedText {
  const file = FILE_BY_PREFIX[key.split('.')[0]];
  if (!file) throw new Error(`Нет CSV-файла для ключа ${key}`);
  en = cleanText(en);
  const target: LocalizedText = { en };
  const entry = texts.get(key);
  if (entry) {
    if (entry.en !== en) warn(`Ключ ${key} используется с разными текстами`);
    entry.targets.push(target);
  } else {
    texts.set(key, { en, file, targets: [target] });
  }
  return target;
}

/**
 * Необязательные тексты, которые пишутся в CSV вручную (например, spell.<id>.short): английский — из колонки en.
 * Ключ → английский текст; пустые строки пропускаются.
 */
export async function manualTexts(file: string, suffix: string): Promise<Map<string, string>> {
  const rows = await readTranslations(file);
  return new Map(rows.filter((r) => r.key.endsWith(suffix) && r.en.trim()).map((r) => [r.key, r.en]));
}

/** Спасбросок и область заклинания из английского текста SRD 5.2 (в API 2024 этих полей нет). */
const SAVE_ABILITIES: Record<string, AbilityId> = {
  Strength: 'str',
  Dexterity: 'dex',
  Constitution: 'con',
  Intelligence: 'int',
  Wisdom: 'wis',
  Charisma: 'cha',
};
export function spellSaveFromText(text: string): AbilityId | undefined {
  // Только «makes / succeeds on / fails a X saving throw»: «advantage on Dexterity saving throws» («Ускорение») — не спасбросок от заклинания.
  const m = text.match(/(?:makes?|succeeds? on|fails?) an? (Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma) saving throw\b/);
  return m ? SAVE_ABILITIES[m[1]] : undefined;
}
export function spellAreaFromText(text: string): Spell['area'] {
  // «15-foot Cone», «20-foot-radius Sphere», «100-foot-long, 5-foot-wide Line», «10-foot-radius, 40-foot-high Cylinder».
  const m = text.match(/(\d+)-?foot(?:-radius|-long)?(?:,? \d+-?foot[- ]?(?:wide|high|tall))?[ -](Cone|Cube|Cylinder|Emanation|Line|Sphere)\b/);
  return m ? { shape: m[2].toLowerCase() as SpellAreaShape, size: Number(m[1]) } : undefined;
}

export function txOpt(key: string, en: string | null | undefined): LocalizedText | undefined {
  return en && en.trim() ? tx(key, en) : undefined;
}

/** Ключ для коротких повторяющихся фраз («Action», «60 feet»): одна строка перевода на все заклинания. */
export const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/** Склеивает переносы из PDF («Ar- mor» → «Armor»). */
export function cleanText(s: string): string {
  return s
    .replace(/([A-Za-z]{2,})- (?!(?:the|a|an|and|or|to)\b)([a-z]{2,})/g, '$1$2')
    .trim();
}

type Row = { key: string; en: string; ru: string; status: string };

export async function readTranslations(file: string): Promise<Row[]> {
  const path = join(paths.translations, `${file}.csv`);
  return existsSync(path) ? readTranslationsFrom(path) : [];
}

async function readTranslationsFrom(path: string): Promise<Row[]> {
  const [header, ...rows] = parseCsv(await readFile(path, 'utf8'));
  const col = (name: string) => header.indexOf(name);
  const [k, en, ru, st] = ['key', 'en', 'ru', 'status'].map(col);
  if (k < 0 || en < 0 || ru < 0 || st < 0) throw new Error(`${path}: нужны колонки key, en, ru, status`);
  return rows.map((r) => ({ key: r[k], en: r[en] ?? '', ru: (r[ru] ?? '').trim(), status: r[st] || 'todo' }));
}

/** Названия (короткие строки), перевод которых можно взять по совпадению английского текста. */
const isShortName = (key: string) => /\.(name|abbr)$/.test(key);

/** Перевод 2024 того же CSV: по ключу и, для названий, по английскому тексту. */
async function translationsOf2024(file: string) {
  const path = join(editionPaths('2024').translations, `${file}.csv`);
  const rows = existsSync(path) ? await readTranslationsFrom(path) : [];
  const byKey = new Map(rows.map((r) => [r.key, r]));
  const byName = new Map<string, string>();
  for (const r of rows) if (r.ru && isShortName(r.key) && !byName.has(r.en)) byName.set(r.en, r.ru);
  return { byKey, byName };
}

/** Подставляет перевод, обновляет CSV и возвращает список непереведённых ключей. */
async function applyTranslations() {
  await mkdir(paths.translations, { recursive: true });
  const files = [...new Set(Object.values(FILE_BY_PREFIX))];
  const missing: string[] = [];
  const stats: string[] = [];

  for (const file of files) {
    const existing = new Map((await readTranslations(file)).map((r) => [r.key, r]));
    const reuse = edition === '2014' ? await translationsOf2024(file) : undefined;
    const out: Row[] = [];
    const counts = { done: 0, draft: 0, todo: 0 };

    for (const [key, entry] of texts) {
      if (entry.file !== file) continue;
      const old = existing.get(key);
      existing.delete(key);
      const row: Row = old ? { ...old } : { key, en: entry.en, ru: '', status: 'todo' };
      if (old && old.en !== entry.en) {
        // Английский текст в источнике поменялся — готовый перевод надо перепроверить.
        if (row.ru && row.status === 'done') row.status = 'draft';
        warn(`Изменился английский текст: ${key} — проверьте перевод`);
        row.en = entry.en;
      }
      const seed = ruSeeds.get(key);
      const same = reuse?.byKey.get(key);
      if (!row.ru && same?.ru && same.en === entry.en) {
        // 2014: тот же ключ и тот же английский текст, что в 2024 — перевод подходит как есть.
        row.ru = same.ru;
        row.status = same.status;
      } else if (!row.ru && reuse && isShortName(key) && reuse.byName.has(entry.en)) {
        // 2014: такое же название встречается в 2024 — берём его перевод черновиком.
        row.ru = reuse.byName.get(entry.en)!;
        row.status = 'draft';
      }
      if (!row.ru && seed) {
        row.ru = seed;
        row.status = 'draft';
      }
      if (!row.ru) row.status = 'todo';
      counts[row.status as keyof typeof counts] = (counts[row.status as keyof typeof counts] ?? 0) + 1;

      if (row.ru) for (const t of entry.targets) t.ru = row.ru;
      else missing.push(key);
      out.push(row);
    }

    // Ключи, которых больше нет в данных: с переводом оставляем (чтобы не потерять работу), пустые удаляем.
    for (const row of existing.values()) {
      if (row.ru) {
        warn(`Ключ больше не используется: ${row.key} (${file}.csv)`);
        out.push(row);
      }
    }

    const rows = [['key', 'en', 'ru', 'status'], ...out.map((r) => [r.key, r.en, r.ru, r.status])];
    await writeFile(join(paths.translations, `${file}.csv`), stringifyCsv(rows));
    stats.push(`  ${file}.csv: всего ${out.length}, готово ${counts.done}, черновик ${counts.draft}, нет перевода ${counts.todo}`);
  }
  return { missing, stats };
}

// ---------------------------------------------------------------------------
// Сырые данные
// ---------------------------------------------------------------------------

export type Raw = any;

export async function raw(name: string): Promise<Raw[]> {
  return JSON.parse(await readFile(join(paths.raw, `${name}.json`), 'utf8'));
}

export const ids = (refs: Raw[] | undefined | null): string[] => (refs ?? []).map((r) => r.index);
export const joinText = (...parts: (string[] | undefined)[]) =>
  parts
    .flatMap((p) => p ?? [])
    .filter(Boolean)
    .join('\n');

/** Ссылка на навык (/skills/x) приводится к id владения навыком (skill-x), чтобы все выборы навыков были одинаковыми. */
export function refId(ref: Raw): string {
  if (ref.url?.includes('/skills/')) return `skill-${ref.index}`;
  // В части ссылок index не совпадает с адресом (carpenters-tools → /proficiencies/tool-carpenters-tools).
  if (ref.url?.includes('/proficiencies/')) return proficiencyId(ref.url.split('/').pop());
  return ref.index;
}

/**
 * В разделе 2014 у инструментов id без приставки (thieves-tools, dice-set), в 2024 — tool-thieves-tools, tool-dice.
 * Приводим к виду 2024, чтобы код приложения узнавал одни и те же владения в обеих редакциях.
 */
const PROFICIENCY_ALIASES_2014: Record<string, string> = { 'dice-set': 'tool-dice', 'playing-card-set': 'tool-playing-cards' };
const TOOL_IDS_2014 = new Set([
  'calligraphers-supplies', 'carpenters-tools', 'cartographers-tools', 'cobblers-tools', 'cooks-utensils',
  'disguise-kit', 'forgery-kit', 'glassblowers-tools', 'jewelers-tools', 'leatherworkers-tools', 'masons-tools',
  'navigators-tools', 'painters-supplies', 'poisoners-kit', 'potters-tools', 'smiths-tools', 'thieves-tools',
  'tinkers-tools', 'weavers-tools', 'woodcarvers-tools',
]);

export function proficiencyId(id: string): string {
  if (edition !== '2014') return id;
  return PROFICIENCY_ALIASES_2014[id] ?? (TOOL_IDS_2014.has(id) ? `tool-${id}` : id);
}

export function convChoice(c: Raw, key: string): Choice {
  const choice: Choice = { choose: c.choose ?? 1 };
  const desc = txOpt(`${key}.desc`, c.desc);
  if (desc) choice.desc = desc;
  const from = c.from ?? {};
  if (from.option_set_type === 'equipment_category') choice.fromCategory = from.equipment_category.index;
  // 2014: «любые языки» — ссылка на весь список; варианты подставляет сборка (languageOptions).
  else if (from.option_set_type === 'resource_list') choice.options = resourceList(from.resource_list_url);
  else choice.options = (from.options ?? []).map((o: Raw, i: number) => convOption(o, `${key}.${i}`));
  return choice;
}

export function convOption(o: Raw, key: string): ChoiceOption {
  switch (o.option_type) {
    case 'reference':
      return { kind: 'ref', id: refId(o.item) };
    case 'counted_reference':
      // Иногда вместо предмета указана категория («Holy Symbols») — это выбор любого предмета из неё.
      if (o.of.url?.includes('/equipment-categories/'))
        return { kind: 'choice', choice: { choose: o.count, fromCategory: o.of.index } };
      return { kind: 'item', id: o.of.index, count: o.count };
    case 'money':
      return { kind: 'money', amount: o.count, unit: o.unit as Coin };
    case 'multiple':
      return { kind: 'all', items: o.items.map((x: Raw, i: number) => convOption(x, `${key}.${i}`)) };
    case 'choice':
      return { kind: 'choice', choice: convChoice(o.choice, key) };
    case 'score_prerequisite':
      return { kind: 'minScore', ability: o.ability_score.index, min: o.minimum_score };
    default:
      throw new Error(`Неизвестный option_type ${o.option_type} (${key})`);
  }
}

/** Все записи ресурса для выбора «любой из списка» (пока бывают только языки). */
const resourceLists = new Map<string, string[]>();
export function setResourceList(url: string, list: string[]) {
  resourceLists.set(url, list);
}
function resourceList(url: string): ChoiceOption[] {
  const list = resourceLists.get(url);
  if (!list) throw new Error(`Нет списка для выбора из ${url}`);
  return list.map((id) => ({ kind: 'ref', id }));
}

export const levelOf = (ref: Raw): number => Number(String(ref.index).split('-').pop());

export const PROFICIENCY_TYPES: Record<string, ProficiencyType> = {
  Skills: 'skill',
  'Saving Throws': 'savingThrow',
  Armor: 'armor',
  Weapons: 'weapon',
  Tools: 'tool',
  "Artisan's Tools": 'artisanTool',
  'Musical Instruments': 'instrument',
  // Только в 2014: игровые наборы и транспорт — как прочие инструменты.
  'Gaming Sets': 'tool',
  Vehicles: 'tool',
  Other: 'other',
};

export function seeded(key: string, en: string, ru: string): LocalizedText {
  // Английский текст нужен для английского языка приложения; без него показался бы русский.
  if (/[А-Яа-яЁё]/.test(en)) warn(`Нет английского текста: ${key} — добавьте поле textEn / summaryEn / descEn в data-pipeline/extra`);
  ruSeeds.set(key, ru);
  return tx(key, en);
}

// ---------------------------------------------------------------------------
// Проверка ссылок между данными
// ---------------------------------------------------------------------------

export function checkReferences(c: Omit<Content, 'version'>) {
  const set = (xs: { id: string }[]) => new Set(xs.map((x) => x.id));
  const items = set(c.equipment);
  const categories = set(c.equipmentCategories);
  const profs = set(c.proficiencies);
  const features = set(c.features);
  const abilities = set(c.abilities);
  const check = (where: string, kind: string, id: string, known: Set<string>) => {
    if (!known.has(id)) warn(`${where}: неизвестный ${kind} «${id}»`);
  };

  const walkChoice = (where: string, ch: Choice, refs: Set<string>) => {
    if (ch.fromCategory) check(where, 'категория', ch.fromCategory, categories);
    const walk = (o: ChoiceOption) => {
      if (o.kind === 'item') check(where, 'предмет', o.id, items);
      if (o.kind === 'ref') check(where, 'id', o.id, refs);
      if (o.kind === 'all') o.items.forEach(walk);
      if (o.kind === 'choice') walkChoice(where, o.choice, refs);
    };
    ch.options?.forEach(walk);
  };

  for (const cl of c.classes) {
    const w = `класс ${cl.id}`;
    cl.proficiencies.forEach((id) => check(w, 'владение', id, profs));
    cl.proficiencyChoices.forEach((ch) => walkChoice(w, ch, profs));
    cl.startingEquipment.forEach((ch) => walkChoice(w, ch, items));
    cl.levels.forEach((l) => l.features.forEach((id) => check(w, 'умение', id, features)));
    cl.subclasses.forEach((id) => check(w, 'подкласс', id, set(c.subclasses)));
  }
  for (const b of c.backgrounds) {
    const w = `предыстория ${b.id}`;
    if (b.featId) check(w, 'черта', b.featId, set(c.feats));
    b.proficiencies.forEach((id) => check(w, 'владение', id, profs));
    b.proficiencyChoices.forEach((ch) => walkChoice(w, ch, profs));
    b.equipment.forEach((ch) => walkChoice(w, ch, items));
    b.abilities.forEach((id) => check(w, 'характеристика', id, abilities));
  }
  for (const f of c.feats) f.proficiencyChoices?.forEach((ch) => walkChoice(`черта ${f.id}`, ch, profs));
  const traits = set(c.traits);
  const spells = set(c.spells);
  for (const s of c.species) s.traits.forEach((id) => check(`вид ${s.id}`, 'особенность', id, traits));
  for (const s of c.subspecies) s.traits.forEach((t) => check(`подвид ${s.id}`, 'особенность', t.id, traits));
  for (const t of c.traits) {
    t.spells?.forEach((id) => check(`особенность ${t.id}`, 'заклинание', id, spells));
    t.proficiencyChoices?.forEach((ch) => walkChoice(`особенность ${t.id}`, ch, profs));
  }
  const known = new Set([...features, ...traits, ...set(c.feats)]);
  for (const r of c.resources) {
    r.features.forEach((id) => check(`ресурс ${r.id}`, 'умение', id, known));
    if (r.classId) check(`ресурс ${r.id}`, 'класс', r.classId, set(c.classes));
  }
  const options = set(c.classOptions);
  for (const o of c.classOptions) {
    o.spells?.forEach((s) => check(`воззвание ${o.id}`, 'заклинание', s.id, spells));
    if (o.prerequisite?.invocation) check(`воззвание ${o.id}`, 'воззвание', o.prerequisite.invocation, options);
  }
  for (const e of c.equipment) e.contents?.forEach((x) => check(`набор ${e.id}`, 'предмет', x.id, items));
  const anyItems = new Set([...items, ...set(c.magicItems)]);
  for (const cat of c.equipmentCategories)
    cat.equipment.forEach((id) => check(`категория ${cat.id}`, 'предмет', id, anyItems));
}

// ---------------------------------------------------------------------------

/** Собирает справочник, проверяет ссылки, подставляет перевод и пишет файл. */
export async function finish(build: () => Promise<Omit<Content, 'version'>>) {
  const content = await build();
  checkReferences(content);
  const { missing, stats } = await applyTranslations();

  const json = JSON.stringify(content);
  const version = createHash('sha256').update(json).digest('hex').slice(0, 12);
  await mkdir(dirname(paths.out), { recursive: true });
  await writeFile(paths.out, JSON.stringify({ ...content, version }));
  await writeFile(paths.report, missing.join('\n') + '\n');

  const rel = (p: string) => p.slice(join(ROOT, '..').length + 1);
  console.log(`Справочник ${edition} собран: ${rel(paths.out)} (версия ${version}, ${Math.round(json.length / 1024)} КБ)`);
  console.log(
    `  классов ${content.classes.length}, умений ${content.features.length}, видов ${content.species.length}, ` +
      `предысторий ${content.backgrounds.length}, черт ${content.feats.length}, предметов ${content.equipment.length}, ` +
      `заклинаний ${content.spells.length}, магических предметов ${content.magicItems.length}`,
  );
  console.log('Перевод:');
  stats.forEach((s) => console.log(s));
  if (missing.length) {
    console.warn(`⚠ Без перевода ${missing.length} ключей (покажем английский текст). Список: ${rel(paths.report)}`);
    console.warn(`  например: ${missing.slice(0, 5).join(', ')}`);
  }
  if (warnings.length) {
    console.warn(`⚠ Предупреждения (${warnings.length}):`);
    warnings.forEach((w) => console.warn(`  - ${w}`));
  }
}
