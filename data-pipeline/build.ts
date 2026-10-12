// Собирает справочник assets/content/content.json из data-pipeline/raw/*.json и перевода.
// Запуск: npm run data:build
//
// Что делает:
// 1. Превращает сырые данные API в нашу структуру (типы — src/shared/content/types.ts).
// 2. Каждому тексту даёт ключ перевода (например, spell.shield.name) и подставляет русский текст
//    из data-pipeline/translations/*.csv.
// 3. Дописывает в CSV новые ключи (status = todo), чтобы их можно было перевести в таблице.
// 4. Предупреждает о непереведённых ключах и битых ссылках между данными.

import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import type {
  AbilityId,
  Choice,
  ChoiceOption,
  Coin,
  ClassOption,
  ClassResource,
  Content,
  Feature,
  LocalizedText,
  ProficiencyType,
  Species,
  Subspecies,
  Trait,
} from '../src/shared/content/types.ts';
import { parseCsv, stringifyCsv } from './csv.ts';

const SCHEMA_VERSION = 2;
const ROOT = dirname(fileURLToPath(import.meta.url));
const RAW_DIR = join(ROOT, 'raw');
const EXTRA_DIR = join(ROOT, 'extra');
const SRD_DIR = join(ROOT, 'srd');
const TRANSLATIONS_DIR = join(ROOT, 'translations');
const REPORT_FILE = join(ROOT, 'missing-translations.txt');
const OUT_FILE = join(ROOT, '..', 'assets', 'content', 'content.json');

const warnings: string[] = [];
const warn = (msg: string) => warnings.push(msg);

// ---------------------------------------------------------------------------
// Переводы
// ---------------------------------------------------------------------------

/** В какой CSV-файл попадает ключ — по первой части ключа. */
const FILE_BY_PREFIX: Record<string, string> = {
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
const ruSeeds = new Map<string, string>();

/** Регистрирует текст под ключом перевода и возвращает объект, куда позже подставится `ru`. */
function tx(key: string, en: string): LocalizedText {
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

function txOpt(key: string, en: string | null | undefined): LocalizedText | undefined {
  return en && en.trim() ? tx(key, en) : undefined;
}

/** Ключ для коротких повторяющихся фраз («Action», «60 feet»): одна строка перевода на все заклинания. */
const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/** Склеивает переносы из PDF («Ar- mor» → «Armor»). */
function cleanText(s: string): string {
  return s
    .replace(/([A-Za-z]{2,})- (?!(?:the|a|an|and|or|to)\b)([a-z]{2,})/g, '$1$2')
    .trim();
}

type Row = { key: string; en: string; ru: string; status: string };

async function readTranslations(file: string): Promise<Row[]> {
  const path = join(TRANSLATIONS_DIR, `${file}.csv`);
  if (!existsSync(path)) return [];
  const [header, ...rows] = parseCsv(await readFile(path, 'utf8'));
  const col = (name: string) => header.indexOf(name);
  const [k, en, ru, st] = ['key', 'en', 'ru', 'status'].map(col);
  if (k < 0 || en < 0 || ru < 0 || st < 0) throw new Error(`${file}.csv: нужны колонки key, en, ru, status`);
  return rows.map((r) => ({ key: r[k], en: r[en] ?? '', ru: (r[ru] ?? '').trim(), status: r[st] || 'todo' }));
}

/** Подставляет перевод, обновляет CSV и возвращает список непереведённых ключей. */
async function applyTranslations() {
  await mkdir(TRANSLATIONS_DIR, { recursive: true });
  const files = [...new Set(Object.values(FILE_BY_PREFIX))];
  const missing: string[] = [];
  const stats: string[] = [];

  for (const file of files) {
    const existing = new Map((await readTranslations(file)).map((r) => [r.key, r]));
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
    await writeFile(join(TRANSLATIONS_DIR, `${file}.csv`), stringifyCsv(rows));
    stats.push(`  ${file}.csv: всего ${out.length}, готово ${counts.done}, черновик ${counts.draft}, нет перевода ${counts.todo}`);
  }
  return { missing, stats };
}

// ---------------------------------------------------------------------------
// Сырые данные
// ---------------------------------------------------------------------------

type Raw = any;

async function raw(name: string): Promise<Raw[]> {
  return JSON.parse(await readFile(join(RAW_DIR, `${name}.json`), 'utf8'));
}

const ids = (refs: Raw[] | undefined | null): string[] => (refs ?? []).map((r) => r.index);
const joinText = (...parts: (string[] | undefined)[]) =>
  parts
    .flatMap((p) => p ?? [])
    .filter(Boolean)
    .join('\n');

/** Ссылка на навык (/skills/x) приводится к id владения навыком (skill-x), чтобы все выборы навыков были одинаковыми. */
function refId(ref: Raw): string {
  if (ref.url?.includes('/skills/')) return `skill-${ref.index}`;
  // В части ссылок index не совпадает с адресом (carpenters-tools → /proficiencies/tool-carpenters-tools).
  if (ref.url?.includes('/proficiencies/')) return ref.url.split('/').pop();
  return ref.index;
}

function convChoice(c: Raw, key: string): Choice {
  const choice: Choice = { choose: c.choose ?? 1 };
  const desc = txOpt(`${key}.desc`, c.desc);
  if (desc) choice.desc = desc;
  const from = c.from ?? {};
  if (from.option_set_type === 'equipment_category') choice.fromCategory = from.equipment_category.index;
  else choice.options = (from.options ?? []).map((o: Raw, i: number) => convOption(o, `${key}.${i}`));
  return choice;
}

function convOption(o: Raw, key: string): ChoiceOption {
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

const levelOf = (ref: Raw): number => Number(String(ref.index).split('-').pop());

const PROFICIENCY_TYPES: Record<string, ProficiencyType> = {
  Skills: 'skill',
  'Saving Throws': 'savingThrow',
  Armor: 'armor',
  Weapons: 'weapon',
  Tools: 'tool',
  "Artisan's Tools": 'artisanTool',
  'Musical Instruments': 'instrument',
  Other: 'other',
};

// ---------------------------------------------------------------------------
// Не-SRD механика: data-pipeline/extra/*.json (предыстории и черты Player's Handbook 2024).
// Только механика, тексты книги не используются. Формат — см. data-pipeline/README.md.
// ---------------------------------------------------------------------------

/** Предыстории SRD 5.2 с «Посвящённым в магию» и его списком заклинаний. */
const SRD_FEAT_SPELL_LIST: Record<string, string> = { acolyte: 'cleric', sage: 'wizard' };

type ExtraProfChoice = {
  choose: number;
  options?: string[];
  /** anyTool — любой инструмент (инструменты, ремесленные, музыкальные); skill — любой навык. */
  fromProficiencyType?: 'artisanTool' | 'instrument' | 'gamingSet' | 'skill' | 'anyTool';
  /** Подсказка к выбору: по-русски и по-английски. */
  desc?: string;
  descEn?: string;
};

const ANY_TOOL_TYPES: ProficiencyType[] = ['tool', 'artisanTool', 'instrument'];

function equipmentCategoriesForExtra(rawCategories: Raw[]): Map<string, string[]> {
  return new Map(rawCategories.map((c) => [c.index, ids(c.equipment)]));
}

async function readExtra(
  proficiencies: { id: string; type: ProficiencyType; refId?: string }[],
  categories: Map<string, string[]>,
) {
  const read = async (name: string) => JSON.parse(await readFile(join(EXTRA_DIR, `${name}.json`), 'utf8'));
  const gamingSets = new Set(categories.get('gaming-sets') ?? []);

  const profChoice = (c: ExtraProfChoice, where: string, descKey?: string): Choice => {
    let options = c.options ?? [];
    if (c.fromProficiencyType === 'gamingSet') {
      options = proficiencies.filter((p) => p.refId && gamingSets.has(p.refId)).map((p) => p.id);
    } else if (c.fromProficiencyType === 'anyTool') {
      options = proficiencies.filter((p) => ANY_TOOL_TYPES.includes(p.type)).map((p) => p.id);
    } else if (c.fromProficiencyType) {
      options = proficiencies.filter((p) => p.type === c.fromProficiencyType).map((p) => p.id);
    }
    if (!options.length) warn(`${where}: пустой выбор владений`);
    return {
      choose: c.choose,
      ...(c.desc && descKey ? { desc: seeded(descKey, c.descEn ?? c.desc, c.desc) } : {}),
      options: options.map((id) => ({ kind: 'ref', id })),
    };
  };

  const backgrounds = (await read('backgrounds')).backgrounds.map((b: Raw) => {
    const kit: ChoiceOption = {
      kind: 'all',
      items: [
        ...b.equipment.items.map(([id, count]: [string, number]): ChoiceOption => ({ kind: 'item', id, count })),
        ...(b.equipment.pickFromCategory ?? []).map(
          (cat: string): ChoiceOption => ({ kind: 'choice', choice: { choose: 1, fromCategory: cat } }),
        ),
        { kind: 'money', amount: b.equipment.gp, unit: 'gp' },
      ],
    };
    return {
      id: b.id,
      name: tx(`background.${b.id}.name`, b.name),
      abilities: b.abilities as AbilityId[],
      featId: b.feat,
      ...(b.featSpellList ? { featSpellList: b.featSpellList } : {}),
      proficiencies: b.proficiencies,
      proficiencyChoices: (b.proficiencyChoices ?? []).map((c: ExtraProfChoice) => profChoice(c, `предыстория ${b.id}`)),
      // Как у всех предысторий 2024: набор или 50 зм.
      equipment: [{ choose: 1, options: [kit, { kind: 'money', amount: 50, unit: 'gp' }] } as Choice],
      extra: true,
    };
  });

  const feats = (await read('feats')).feats.map((f: Raw) => ({
    id: f.id,
    name: tx(`feat.${f.id}.name`, f.name),
    type: f.type,
    description: tx(`feat.${f.id}.description`, f.description),
    ...(f.proficiencyChoices?.length
      ? { proficiencyChoices: f.proficiencyChoices.map((c: ExtraProfChoice) => profChoice(c, `черта ${f.id}`)) }
      : {}),
    extra: true,
  }));

  // Подклассы: extra/subclasses-*.json. Названия на двух языках, описания сразу по-русски.
  const subclasses: Raw[] = [];
  const features: Raw[] = [];
  const files = (await readdir(EXTRA_DIR)).filter((f) => /^subclasses.*\.json$/.test(f)).sort();
  for (const file of files) {
    for (const sc of JSON.parse(await readFile(join(EXTRA_DIR, file), 'utf8')).subclasses as Raw[]) {
      const featureIds: string[] = [];
      for (const f of sc.features as Raw[]) {
        const id = `${sc.id}-${slug(f.name.en)}`;
        featureIds.push(id);
        features.push({
          id,
          classId: sc.classId,
          subclassId: sc.id,
          level: f.level,
          name: seeded(`feature.${id}.name`, f.name.en, f.name.ru),
          description: seeded(`feature.${id}.description`, f.textEn ?? f.text, f.text),
          extra: true,
        });
      }
      subclasses.push({
        id: sc.id,
        classId: sc.classId,
        name: seeded(`subclass.${sc.id}.name`, sc.name.en, sc.name.ru),
        summary: seeded(`subclass.${sc.id}.summary`, sc.summaryEn ?? sc.summary, sc.summary),
        description: seeded(`subclass.${sc.id}.description`, sc.summaryEn ?? sc.summary, sc.summary),
        features: featureIds,
        extra: true,
      });
    }
  }

  // Ресурсы умений (ярость, дикий облик, кости превосходства…): extra/resources.json.
  const resources: ClassResource[] = (JSON.parse(await readFile(join(EXTRA_DIR, 'resources.json'), 'utf8')).resources as Raw[]).map(
    (r) => ({
      ...r,
      name: seeded(`resource.${r.id}.name`, r.name.en, r.name.ru),
      features: Array.isArray(r.features) ? r.features : [r.features],
    }),
  );

  // Виды: extra/species.json. Особенность — объект (новая) или строка (id особенности SRD).
  const species: Species[] = [];
  const subspecies: Subspecies[] = [];
  const traits: Trait[] = [];
  /** Существующие особенности SRD, которые получают новые виды: id особенности → id видов. */
  const sharedTraits = new Map<string, string[]>();
  const trait = (t: Raw, speciesId: string, subspeciesId?: string): Trait => ({
    id: t.id,
    name: seeded(`trait.${t.id}.name`, t.name.en, t.name.ru),
    description: seeded(`trait.${t.id}.description`, t.textEn ?? t.text, t.text),
    species: [speciesId],
    subspecies: subspeciesId ? [subspeciesId] : [],
    ...(t.spells ? { spells: t.spells } : {}),
    ...(t.proficiencyChoices
      ? {
          proficiencyChoices: t.proficiencyChoices.map((c: ExtraProfChoice, i: number) =>
            profChoice(c, `особенность ${t.id}`, `trait.${t.id}.proficiencyChoice.${i}.desc`),
          ),
        }
      : {}),
    ...(t.speed ? { speed: t.speed } : {}),
    extra: true,
  });
  for (const s of (await read('species')).species as Raw[]) {
    const traitIds = (s.traits as (string | Raw)[]).map((t) => {
      if (typeof t === 'string') {
        sharedTraits.set(t, [...(sharedTraits.get(t) ?? []), s.id]);
        return t;
      }
      traits.push(trait(t, s.id));
      return t.id as string;
    });
    for (const sub of (s.subspecies ?? []) as Raw[]) {
      subspecies.push({
        id: sub.id,
        speciesId: s.id,
        name: seeded(`subspecies.${sub.id}.name`, sub.name.en, sub.name.ru),
        traits: (sub.traits as Raw[]).map((t) => {
          traits.push(trait(t, s.id, sub.id));
          return { id: t.id, level: t.level ?? 1 };
        }),
        extra: true,
      });
    }
    species.push({
      id: s.id,
      name: seeded(`species.${s.id}.name`, s.name.en, s.name.ru),
      creatureType: s.creatureType,
      sizes: s.sizes,
      speed: s.speed,
      traits: traitIds,
      subspecies: ((s.subspecies ?? []) as Raw[]).map((sub) => sub.id),
      extra: true,
    });
  }

  return { backgrounds, feats, subclasses, features, resources, species, subspecies, traits, sharedTraits };
}

/** Текст из extra: английский — для ключа, русский — сразу в перевод. */
/** Воззвания колдуна и метамагия чародея из SRD 5.2 (в API их нет): srd/class-options.json, перевод — наш. */
async function readClassOptions(): Promise<ClassOption[]> {
  const data = JSON.parse(await readFile(join(SRD_DIR, 'class-options.json'), 'utf8'));
  const conv = (kind: ClassOption['kind'], classId: string) => (o: Raw): ClassOption => ({
    id: o.id,
    classId,
    kind,
    name: seeded(`classOption.${o.id}.name`, o.name.en, o.name.ru),
    description: seeded(`classOption.${o.id}.description`, o.en, o.ru),
    ...(o.prerequisite ? { prerequisite: o.prerequisite } : {}),
    ...(o.repeatable ? { repeatable: true } : {}),
    ...(o.cost ? { cost: o.cost } : {}),
    ...(o.spells ? { spells: o.spells } : {}),
  });
  return [...data.invocations.map(conv('invocation', 'warlock')), ...data.metamagic.map(conv('metamagic', 'sorcerer'))];
}

function seeded(key: string, en: string, ru: string): LocalizedText {
  // Английский текст нужен для английского языка приложения; без него показался бы русский.
  if (/[А-Яа-яЁё]/.test(en)) warn(`Нет английского текста: ${key} — добавьте поле textEn / summaryEn / descEn в data-pipeline/extra`);
  ruSeeds.set(key, ru);
  return tx(key, en);
}

// ---------------------------------------------------------------------------
// Сборка
// ---------------------------------------------------------------------------

async function build(): Promise<Omit<Content, 'version'>> {
  const abilities = (await raw('ability-scores')).map((a) => ({
    id: a.index as AbilityId,
    abbr: tx(`ability.${a.index}.abbr`, a.name),
    name: tx(`ability.${a.index}.name`, a.full_name),
    description: tx(`ability.${a.index}.description`, a.description),
  }));

  const skills = (await raw('skills')).map((s) => ({
    id: s.index,
    ability: s.ability_score.index as AbilityId,
    name: tx(`skill.${s.index}.name`, s.name),
    description: tx(`skill.${s.index}.description`, s.description),
  }));

  const alignments = (await raw('alignments')).map((a) => ({
    id: a.index,
    abbr: tx(`alignment.${a.index}.abbr`, a.abbreviation),
    name: tx(`alignment.${a.index}.name`, a.name),
    description: tx(`alignment.${a.index}.description`, a.description),
  }));

  // В API у Друидического нет пометки «редкий», а в SRD 5.2 он в таблице редких языков.
  const RARE_LANGUAGES = new Set(['druidic']);
  const languages = (await raw('languages')).map((l) => ({
    id: l.index,
    name: tx(`language.${l.index}.name`, l.name),
    rare: Boolean(l.is_rare) || RARE_LANGUAGES.has(l.index),
    ...(l.note ? { note: tx(`language.${l.index}.note`, l.note) } : {}),
  }));

  const simple = async (resource: string, prefix: string) =>
    (await raw(resource)).map((x) => ({
      id: x.index,
      name: tx(`${prefix}.${x.index}.name`, x.name),
      description: tx(`${prefix}.${x.index}.description`, x.description ?? ''),
    }));

  const conditions = await simple('conditions', 'condition');
  const damageTypes = await simple('damage-types', 'damageType');
  const magicSchools = await simple('magic-schools', 'magicSchool');
  const weaponProperties = await simple('weapon-properties', 'weaponProperty');
  const weaponMasteries = await simple('weapon-mastery-properties', 'weaponMastery');

  const proficiencies = (await raw('proficiencies')).map((p) => {
    // У части инструментов ремесленников API отдаёт 404 — для них fetch сохранил заглушки.
    const type: ProficiencyType = p.missing
      ? ['tool-disguise-kit', 'tool-forgery-kit'].includes(p.index)
        ? 'tool'
        : 'artisanTool'
      : (PROFICIENCY_TYPES[p.type] ?? 'other');
    if (!p.missing && !PROFICIENCY_TYPES[p.type]) warn(`Неизвестный тип владения ${p.type} (${p.index})`);
    return {
      id: p.index,
      type,
      name: tx(`proficiency.${p.index}.name`, p.name),
      ...(p.reference ? { refId: p.reference.index } : {}),
    };
  });

  // --- Классы и умения ---
  const rawLevels = await raw('class-levels');
  const classes = (await raw('classes')).map((c) => {
    const key = `class.${c.index}`;
    const pa = c.primary_ability ?? {};
    const primaryAbilityChoice = Boolean(pa.ability_score_options);
    const primaryAbilities: AbilityId[] = primaryAbilityChoice
      ? pa.ability_score_options.from.options.map((o: Raw) => o.item.index)
      : ids(pa.ability_scores);

    const mc = c.multi_classing ?? {};
    const mcPrereq: Choice[] = [
      ...(mc.prerequisites ?? []).map((p: Raw) => ({
        choose: 1,
        options: [{ kind: 'minScore', ability: p.ability_score.index, min: p.minimum_score }],
      })),
      ...(mc.prerequisite_options ? [convChoice(mc.prerequisite_options, `${key}.multiclass.prerequisite`)] : []),
    ];

    const levels = rawLevels
      .filter((l) => l.class.index === c.index)
      .sort((a, b) => a.level - b.level)
      .map((l) => {
        const sc = l.spellcasting;
        return {
          level: l.level,
          profBonus: l.prof_bonus,
          features: ids(l.features),
          ...(l.class_specific ? { classSpecific: l.class_specific } : {}),
          ...(sc
            ? {
                spellcasting: {
                  cantrips: sc.cantrips_known ?? 0,
                  prepared: sc.prepared_spells ?? 0,
                  slots: [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => sc[`spell_slots_level_${n}`] ?? 0),
                },
              }
            : {}),
        };
      });
    if (levels.length !== 20) warn(`У класса ${c.index} ${levels.length} уровней вместо 20`);

    return {
      id: c.index,
      name: tx(`${key}.name`, c.name),
      hitDie: c.hit_die,
      primaryAbilities,
      primaryAbilityChoice,
      savingThrows: ids(c.saving_throws) as AbilityId[],
      proficiencies: ids(c.proficiencies).filter((id) => !id.startsWith('saving-throw-')),
      proficiencyChoices: (c.proficiency_choices ?? []).map((ch: Raw, i: number) =>
        convChoice(ch, `${key}.proficiencyChoice.${i}`),
      ),
      startingEquipment: (c.starting_equipment_options ?? []).map((ch: Raw, i: number) =>
        convChoice(ch, `${key}.equipment.${i}`),
      ),
      multiclass: {
        prerequisites: mcPrereq,
        proficiencies: ids(mc.proficiencies),
        proficiencyChoices: (mc.proficiency_choices ?? []).map((ch: Raw, i: number) =>
          convChoice(ch, `${key}.multiclass.proficiencyChoice.${i}`),
        ),
      },
      ...(c.spellcasting
        ? { spellcasting: { ability: c.spellcasting.spellcasting_ability.index, fromLevel: c.spellcasting.level } }
        : {}),
      subclasses: ids(c.subclasses),
      levels,
    };
  });

  const classOrder = new Map(classes.map((c, i) => [c.id, i]));
  const rawFeatures = (await raw('features')).map((f) => ({ raw: f, level: levelOf(f.level) }));
  // Порядок для таблиц перевода: класс → сначала умения класса → уровень.
  rawFeatures.sort(
    (a, b) =>
      (classOrder.get(a.raw.class.index) ?? 99) - (classOrder.get(b.raw.class.index) ?? 99) ||
      Number(Boolean(a.raw.subclass)) - Number(Boolean(b.raw.subclass)) ||
      a.level - b.level,
  );
  const features: Feature[] = rawFeatures.map(({ raw: f, level }) => ({
    id: f.index,
    classId: f.class.index,
    ...(f.subclass ? { subclassId: f.subclass.index } : {}),
    level,
    name: tx(`feature.${f.index}.name`, f.name),
    description: tx(`feature.${f.index}.description`, f.description ?? ''),
  }));

  const subclasses = (await raw('subclasses')).map((s) => {
    const key = `subclass.${s.index}`;
    const own = features.filter((f) => f.subclassId === s.index);
    // Умения, которые есть в описании подкласса, но отсутствуют в /features, добавляем сами.
    for (const sf of s.features ?? []) {
      if (own.some((f) => f.name.en.toLowerCase() === cleanText(sf.name).toLowerCase())) continue;
      const id = `${s.index}-${slug(sf.name)}`;
      const feature: Feature = {
        id,
        classId: s.class.index,
        subclassId: s.index,
        level: sf.level,
        name: tx(`feature.${id}.name`, sf.name),
        description: tx(`feature.${id}.description`, sf.description ?? ''),
      };
      features.push(feature);
      own.push(feature);
    }
    own.sort((a, b) => a.level - b.level);
    return {
      id: s.index,
      classId: s.class.index,
      name: tx(`${key}.name`, s.name),
      summary: tx(`${key}.summary`, s.summary ?? ''),
      description: tx(`${key}.description`, s.description ?? ''),
      features: own.map((f) => f.id),
    };
  });

  // --- Виды, черты вида, предыстории, черты ---
  const species: Species[] = (await raw('species')).map((s) => ({
    id: s.index,
    name: tx(`species.${s.index}.name`, s.name),
    creatureType: s.type,
    sizes: s.size ? [s.size] : (s.size_options?.from?.options ?? []).map((o: Raw) => o.size),
    speed: s.speed,
    traits: ids(s.traits),
    subspecies: ids(s.subspecies),
  }));

  const subspecies: Subspecies[] = (await raw('subspecies')).map((s) => ({
    id: s.index,
    speciesId: s.species.index,
    name: tx(`subspecies.${s.index}.name`, s.name),
    ...(s.damage_type ? { damageType: s.damage_type.index } : {}),
    traits: (s.traits ?? []).map((t: Raw) => ({ id: t.index, level: t.level ?? 1 })),
  }));

  // Заклинания, которых нет в данных API, хотя они названы в тексте особенности SRD 5.2.
  const TRAIT_SPELLS: Record<string, string[]> = { 'otherworldly-presence': ['thaumaturgy'] };
  const traits: Trait[] = (await raw('traits')).map((t) => ({
    id: t.index,
    name: tx(`trait.${t.index}.name`, t.name),
    description: tx(`trait.${t.index}.description`, t.description ?? ''),
    species: ids(t.species),
    subspecies: ids(t.subspecies),
    ...(t.spells?.length
      ? { spells: t.spells.map((x: Raw) => x.spell.index) }
      : TRAIT_SPELLS[t.index]
        ? { spells: TRAIT_SPELLS[t.index] }
        : {}),
    ...(t.proficiency_choices
      ? {
          proficiencyChoices: [t.proficiency_choices]
            .flat()
            .map((ch: Raw, i: number) => convChoice(ch, `trait.${t.index}.proficiencyChoice.${i}`)),
        }
      : {}),
    ...(t.speed ? { speed: t.speed } : {}),
  }));

  const backgrounds = (await raw('backgrounds')).map((b) => ({
    id: b.index,
    name: tx(`background.${b.index}.name`, b.name),
    abilities: ids(b.ability_scores) as AbilityId[],
    featId: b.feat.index,
    // В SRD 5.2 черта названа «Magic Initiate (Cleric)» и т.п., а в API список потерян.
    ...(SRD_FEAT_SPELL_LIST[b.index] ? { featSpellList: SRD_FEAT_SPELL_LIST[b.index] } : {}),
    proficiencies: ids(b.proficiencies),
    proficiencyChoices: (b.proficiency_choices ?? []).map((ch: Raw, i: number) =>
      convChoice(ch, `background.${b.index}.proficiencyChoice.${i}`),
    ),
    equipment: (b.equipment_options ?? []).map((ch: Raw, i: number) =>
      convChoice(ch, `background.${b.index}.equipment.${i}`),
    ),
  }));

  const feats = (await raw('feats')).map((f) => {
    const p = f.prerequisites ?? {};
    const prerequisites = {
      ...(p.minimum_level ? { minLevel: p.minimum_level } : {}),
      ...(p.feature_named ? { feature: p.feature_named } : {}),
      ...(f.prerequisite_options
        ? { abilityOptions: convChoice(f.prerequisite_options, `feat.${f.index}.prerequisite`) }
        : {}),
    };
    return {
      id: f.index,
      name: tx(`feat.${f.index}.name`, f.name),
      type: f.type,
      description: tx(`feat.${f.index}.description`, f.description ?? ''),
      ...(Object.keys(prerequisites).length ? { prerequisites } : {}),
      ...(f.repeatable ? { repeatable: tx(`feat.${f.index}.repeatable`, f.repeatable) } : {}),
    };
  });

  // --- Не-SRD механика (data-pipeline/extra) ---
  const extra = await readExtra(proficiencies, equipmentCategoriesForExtra(await raw('equipment-categories')));
  backgrounds.push(...extra.backgrounds);
  feats.push(...extra.feats);
  features.push(...extra.features);
  subclasses.push(...extra.subclasses);
  for (const sc of extra.subclasses) classes.find((c) => c.id === sc.classId)?.subclasses.push(sc.id);
  species.push(...extra.species);
  subspecies.push(...extra.subspecies);
  traits.push(...extra.traits);
  for (const [id, speciesIds] of extra.sharedTraits) {
    const t = traits.find((x) => x.id === id);
    if (t) t.species.push(...speciesIds);
    else warn(`Виды ${speciesIds.join(', ')}: нет особенности ${id}`);
  }

  // --- Снаряжение ---
  const equipment = (await raw('equipment')).map((e) => {
    const key = `equipment.${e.index}`;
    const cats: string[] = ids(e.equipment_categories);
    const has = (c: string) => cats.includes(c);
    const description = joinText(e.description, e.desc, e.notes);
    const item: Raw = {
      id: e.index,
      name: tx(`${key}.name`, e.name),
      categories: cats,
      cost: { amount: e.cost.quantity, unit: e.cost.unit },
      ...(e.weight !== undefined ? { weight: e.weight } : {}),
      ...(e.quantity ? { quantity: e.quantity } : {}),
      ...(description ? { description: tx(`${key}.description`, description) } : {}),
    };
    if (has('weapons')) {
      const dmg = (d: Raw) => d && { dice: d.damage_dice, type: d.damage_type.index };
      item.weapon = {
        category: has('martial-weapons') ? 'martial' : 'simple',
        range: has('ranged-weapons') ? 'ranged' : 'melee',
        ...(e.damage ? { damage: dmg(e.damage) } : {}),
        ...(e.two_handed_damage ? { twoHandedDamage: dmg(e.two_handed_damage) } : {}),
        reach: e.range ?? { normal: 5 },
        ...(e.throw_range ? { throwRange: e.throw_range } : {}),
        properties: ids(e.properties),
        ...(e.mastery ? { mastery: e.mastery.index } : {}),
        ...(e.ammunition ? { ammunition: e.ammunition.index } : {}),
      };
    }
    if (e.armor_class) {
      const ac = e.armor_class;
      item.armor = {
        category: has('shields')
          ? 'shield'
          : has('heavy-armor')
            ? 'heavy'
            : has('medium-armor')
              ? 'medium'
              : 'light',
        base: ac.base,
        dexBonus: Boolean(ac.dex_bonus),
        ...(ac.dex_bonus && ac.max_bonus != null ? { maxDex: ac.max_bonus } : {}),
        strMinimum: e.str_minimum ?? 0,
        stealthDisadvantage: Boolean(e.stealth_disadvantage),
      };
    }
    if (e.ability || e.utilize?.length || e.craft?.length) {
      item.tool = {
        ...(e.ability ? { ability: e.ability.index } : {}),
        utilize: (e.utilize ?? []).map((u: Raw, i: number) => ({
          name: tx(`${key}.utilize.${i}`, u.name),
          ...(u.dc?.dc_value ? { dc: u.dc.dc_value } : {}),
        })),
        craft: ids(e.craft),
      };
    }
    if (e.contents?.length) item.contents = e.contents.map((c: Raw) => ({ id: c.item.index, count: c.quantity }));
    return item;
  });

  const equipmentCategories = (await raw('equipment-categories')).map((c) => ({
    id: c.index,
    name: tx(`equipmentCategory.${c.index}.name`, c.name),
    equipment: ids(c.equipment),
  }));

  // --- Заклинания и магические предметы ---
  const spellText = (en: string) => {
    // Чистим артефакты источника: «up to 1 hour» / «Up to 1 hour», «30 feet Component: V, S».
    en = en.replace(/\s*Component:.*$/, '');
    en = en.charAt(0).toUpperCase() + en.slice(1);
    return tx(`spellText.${slug(en)}`, en);
  };
  const spells = (await raw('spells')).map((s) => {
    const key = `spell.${s.index}`;
    const d = s.damage;
    return {
      id: s.index,
      name: tx(`${key}.name`, s.name),
      level: s.level,
      school: s.school.index,
      castingTime: spellText(s.casting_time),
      range: spellText(s.range),
      duration: spellText(s.duration),
      components: s.components ?? [],
      ...(s.material ? { material: tx(`${key}.material`, s.material) } : {}),
      concentration: Boolean(s.concentration),
      ritual: Boolean(s.ritual),
      ...(s.attack_type ? { attackType: s.attack_type } : {}),
      ...(d
        ? {
            damage: {
              ...(d.damage_type ? { type: d.damage_type.index } : {}),
              ...(d.damage_at_slot_level ? { bySlotLevel: d.damage_at_slot_level } : {}),
              ...(d.damage_at_character_level ? { byCharacterLevel: d.damage_at_character_level } : {}),
            },
          }
        : {}),
      description: tx(`${key}.description`, s.description ?? ''),
      ...(s.higher_level ? { higherLevel: tx(`${key}.higherLevel`, s.higher_level) } : {}),
      classes: ids(s.classes),
      subclasses: ids(s.subclasses),
    };
  });

  const itemText = (en: string) => tx(`magicItemText.${slug(en)}`, en);
  const magicItems = (await raw('magic-items')).map((m) => {
    const key = `magicItem.${m.index}`;
    const [kind = '', ...rest] = m.desc ?? [];
    return {
      id: m.index,
      name: tx(`${key}.name`, m.name),
      category: m.equipment_category?.index ?? '',
      kind: itemText(kind),
      rarity: itemText(m.rarity?.name ?? ''),
      attunement: Boolean(m.attunement),
      ...(m['limited-to'] ? { limitedTo: tx(`${key}.limitedTo`, m['limited-to']) } : {}),
      description: tx(`${key}.description`, rest.join('\n')),
      variants: ids(m.variants),
      isVariant: Boolean(m.variant),
    };
  });

  return {
    schemaVersion: SCHEMA_VERSION,
    source: 'SRD 5.2 (CC BY 4.0) via dnd5eapi.co/api/2024; механика не-SRD видов, предысторий, черт и подклассов — data-pipeline/extra',
    abilities,
    skills,
    alignments,
    languages,
    conditions,
    damageTypes,
    magicSchools,
    weaponProperties,
    weaponMasteries,
    proficiencies,
    classes,
    features,
    subclasses,
    species,
    subspecies,
    traits,
    backgrounds,
    feats,
    equipment,
    equipmentCategories,
    spells,
    magicItems,
    resources: extra.resources,
    classOptions: await readClassOptions(),
  } as Omit<Content, 'version'>;
}

// ---------------------------------------------------------------------------
// Проверка ссылок между данными
// ---------------------------------------------------------------------------

function checkReferences(c: Omit<Content, 'version'>) {
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
    check(w, 'черта', b.featId, set(c.feats));
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

async function main() {
  const content = await build();
  checkReferences(content);
  const { missing, stats } = await applyTranslations();

  const json = JSON.stringify(content);
  const version = createHash('sha256').update(json).digest('hex').slice(0, 12);
  await mkdir(dirname(OUT_FILE), { recursive: true });
  await writeFile(OUT_FILE, JSON.stringify({ ...content, version }));
  await writeFile(REPORT_FILE, missing.join('\n') + '\n');

  console.log(`Справочник собран: assets/content/content.json (версия ${version}, ${Math.round(json.length / 1024)} КБ)`);
  console.log(
    `  классов ${content.classes.length}, умений ${content.features.length}, видов ${content.species.length}, ` +
      `предысторий ${content.backgrounds.length}, черт ${content.feats.length}, предметов ${content.equipment.length}, ` +
      `заклинаний ${content.spells.length}, магических предметов ${content.magicItems.length}`,
  );
  console.log('Перевод:');
  stats.forEach((s) => console.log(s));
  if (missing.length) {
    console.warn(`⚠ Без перевода ${missing.length} ключей (покажем английский текст). Список: data-pipeline/missing-translations.txt`);
    console.warn(`  например: ${missing.slice(0, 5).join(', ')}`);
  }
  if (warnings.length) {
    console.warn(`⚠ Предупреждения (${warnings.length}):`);
    warnings.forEach((w) => console.warn(`  - ${w}`));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
