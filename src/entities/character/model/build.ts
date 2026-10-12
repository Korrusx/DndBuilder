// Мастер создания персонажа 1-го уровня: какие выборы нужно сделать, что из них следует,
// и чего не хватает, чтобы персонаж был готов. Чистые функции, без React и базы.

import type { AbilityId, Choice, ChoiceOption, Coin, Content } from '@/shared/content';
import { indexOf } from '@/shared/content';
import { CHOICE_KEYS, FEAT_FEATURES, FEATURE_LANGUAGES, FEATURE_OPTIONS } from '../config/constants';
import { choice1 } from './choices';
import { makeProficiencyCheck, proficiencyIds } from './sheet';
import type { Character, EquipmentSource, InventoryItem, OriginFeat, OriginFeatSlot, ProficiencySlot, SpellLimits } from './types';

// ---------- Справочник ----------

export function startingClass(c: Character, content: Content) {
  return indexOf(content).classes.get(c.classes[0]?.classId ?? '');
}

/** Варианты выбора одним списком: ссылки, предметы, «любой из категории», вложенные выборы. */
export function choiceOptionIds(choice: Choice, content: Content): string[] {
  const fromCategory = choice.fromCategory
    ? (indexOf(content).equipmentCategories.get(choice.fromCategory)?.equipment ?? [])
    : [];
  const fromOptions = (choice.options ?? []).flatMap((o): string[] => {
    if (o.kind === 'ref' || o.kind === 'item') return [o.id];
    if (o.kind === 'choice') return choiceOptionIds(o.choice, content);
    return [];
  });
  return [...new Set([...fromCategory, ...fromOptions])];
}

// ---------- Смена класса, предыстории, вида ----------

/** Убирает выборы, ключи которых начинаются с указанных префиксов. */
function dropChoices(choices: Record<string, string[]>, prefixes: string[]): Record<string, string[]> {
  return Object.fromEntries(Object.entries(choices).filter(([k]) => !prefixes.some((p) => k.startsWith(p))));
}

/** Выбор класса сбрасывает всё, что от него зависело. */
export function setClass(c: Character, classId: string): Character {
  if (c.classes[0]?.classId === classId) return c;
  return {
    ...c,
    classes: [{ classId, level: 1 }],
    choices: dropChoices(c.choices, ['class.', 'feature.', 'equip.class']),
    expertise: [],
    weaponMasteries: [],
    feats: c.feats.filter((f) => f.source !== 'class'),
    cantrips: [],
    preparedSpells: [],
  };
}

export function setBackground(c: Character, backgroundId: string): Character {
  if (c.backgroundId === backgroundId) return c;
  return {
    ...c,
    backgroundId,
    backgroundBonuses: {},
    choices: dropChoices(c.choices, ['background.', 'bgfeat.', 'equip.background']),
    expertise: [],
  };
}

export function setSpecies(c: Character, speciesId: string, content: Content): Character {
  if (c.speciesId === speciesId) return c;
  const species = indexOf(content).species.get(speciesId);
  return {
    ...c,
    speciesId,
    subspeciesId: undefined,
    size: species?.sizes.length === 1 ? species.sizes[0] : undefined,
    choices: dropChoices(c.choices, ['trait.', 'versatile.']),
    expertise: [],
  };
}

// ---------- Шаг 2: черты происхождения ----------

export function originFeats(c: Character, content: Content): OriginFeat[] {
  const out: OriginFeat[] = [];
  const background = indexOf(content).backgrounds.get(c.backgroundId);
  if (background) out.push({ slot: 'bgfeat', featId: background.featId, source: 'background' });
  const species = indexOf(content).species.get(c.speciesId);
  if (species?.traits.includes('versatile')) {
    out.push({ slot: 'versatile', featId: choice1(c, CHOICE_KEYS.versatileFeat), source: 'species' });
  }
  return out;
}

// ---------- Шаг 4: владения ----------

/** Все выборы «выберите N владений» для текущего персонажа. */
export function proficiencySlots(c: Character, content: Content): ProficiencySlot[] {
  const slots: ProficiencySlot[] = [];
  const cls = startingClass(c, content);
  cls?.proficiencyChoices.forEach((ch, i) =>
    slots.push({ key: CHOICE_KEYS.classProf(cls.id, i), source: 'class', desc: ch.desc, choose: ch.choose, options: choiceOptionIds(ch, content) }),
  );
  const background = indexOf(content).backgrounds.get(c.backgroundId);
  background?.proficiencyChoices.forEach((ch, i) =>
    slots.push({ key: CHOICE_KEYS.backgroundProf(background.id, i), source: 'background', desc: ch.desc, choose: ch.choose, options: choiceOptionIds(ch, content) }),
  );
  for (const traitId of speciesTraitIds(c, content)) {
    indexOf(content).traits.get(traitId)?.proficiencyChoices?.forEach((ch, i) =>
      slots.push({ key: CHOICE_KEYS.traitProf(traitId, i), source: 'species', desc: ch.desc, choose: ch.choose, options: choiceOptionIds(ch, content) }),
    );
  }
  for (const f of originFeats(c, content)) {
    // Владения на выбор из данных черты («Ремесленник», «Музыкант»).
    (f.featId ? indexOf(content).feats.get(f.featId) : undefined)?.proficiencyChoices?.forEach((ch, i) =>
      slots.push({ key: `${CHOICE_KEYS.featProf(f.slot)}.${i}`, source: 'feat', desc: ch.desc, choose: ch.choose, options: choiceOptionIds(ch, content) }),
    );
    // Черта «Одарённый»: любые три навыка или инструмента.
    if (f.featId !== 'skilled') continue;
    const options = content.proficiencies
      .filter((p) => ['skill', 'tool', 'artisanTool', 'instrument'].includes(p.type))
      .map((p) => p.id);
    slots.push({ key: CHOICE_KEYS.featProf(f.slot), source: 'feat', desc: { en: 'Skilled: three skills or tools', ru: 'Одарённый: три навыка или инструмента' }, choose: 3, options });
  }
  return slots;
}

function speciesTraitIds(c: Character, content: Content): string[] {
  const species = indexOf(content).species.get(c.speciesId);
  const sub = (c.subspeciesId ? indexOf(content).subspecies.get(c.subspeciesId) : undefined);
  return [...(species?.traits ?? []), ...(sub?.traits.filter((t) => t.level <= 1).map((t) => t.id) ?? [])];
}

/** Владения, которые даются без выбора (класс и предыстория). Их нельзя выбрать ещё раз. */
export function fixedProficiencies(c: Character, content: Content): { id: string; source: 'class' | 'background' }[] {
  const cls = startingClass(c, content);
  const background = indexOf(content).backgrounds.get(c.backgroundId);
  return [
    ...(cls?.proficiencies ?? []).map((id) => ({ id, source: 'class' as const })),
    ...(background?.proficiencies ?? []).map((id) => ({ id, source: 'background' as const })),
  ];
}

/** Навыки (id навыков), которыми персонаж владеет — для выбора компетентности. */
export function proficientSkills(c: Character, content: Content): string[] {
  const idx = indexOf(content);
  const skills = new Set(c.skillProficiencies);
  for (const id of proficiencyIds(c, content)) {
    const p = idx.proficiencies.get(id);
    if (p?.type === 'skill' && p.refId) skills.add(p.refId);
  }
  return content.skills.map((s) => s.id).filter((id) => skills.has(id));
}

/** Сколько навыков с компетентностью даёт класс на 1-м уровне (плут: 2). */
export function expertiseCount(c: Character, content: Content): number {
  const cls = startingClass(c, content);
  return cls?.levels[0]?.features.filter((id) => id.endsWith('-expertise')).length ? 2 : 0;
}

/** Сколько видов оружия с приёмами (из таблицы класса; если столбца нет — 2). */
export function weaponMasteryCount(c: Character, content: Content): number {
  // Несколько классов с «Приёмами оружия»: берём наибольшее число, а не сумму.
  return Math.max(0, ...masteryClasses(c, content).map((m) => m.count));
}

/** Классы персонажа, у которых на их уровне есть «Приёмы оружия», и сколько приёмов даёт каждый. */
function masteryClasses(c: Character, content: Content): { classId: string; count: number }[] {
  const classes = indexOf(content).classes;
  return c.classes.flatMap((e) => {
    const rows = classes.get(e.classId)?.levels.slice(0, e.level) ?? [];
    if (!rows.some((r) => r.features.some((id) => id.endsWith('-weapon-mastery')))) return [];
    // Столбец таблицы класса на текущем уровне; если его нет (плут, паладин, следопыт) — 2.
    const fromTable = rows[rows.length - 1]?.classSpecific?.weapon_mastery;
    return [{ classId: e.classId, count: typeof fromTable === 'number' ? fromTable : 2 }];
  });
}

/** Оружие, для которого можно выбрать приём: есть приём и есть владение (варвар — только рукопашное). */
export function weaponMasteryOptions(c: Character, content: Content): string[] {
  // Только рукопашное — если приёмы даёт лишь варвар.
  const meleeOnly = masteryClasses(c, content).every((m) => m.classId === 'barbarian');
  const proficient = makeProficiencyCheck(proficiencyIds(c, content), content);
  return content.equipment
    .filter((e) => e.weapon?.mastery && proficient(e))
    .filter((e) => !meleeOnly || e.weapon?.range === 'melee')
    .map((e) => e.id);
}

/** Умения 1-го уровня, где нужно выбрать вариант. */
export function featureOptionIds(c: Character, content: Content): string[] {
  const cls = startingClass(c, content);
  return (cls?.levels[0]?.features ?? []).filter((id) => FEATURE_OPTIONS[id]);
}

/** Умения 1-го уровня, которые дают черту (воин: «Боевой стиль»). */
export function featFeatureIds(c: Character, content: Content): string[] {
  const cls = startingClass(c, content);
  return (cls?.levels[0]?.features ?? []).filter((id) => FEAT_FEATURES[id]);
}

/** Стандартные языки, из которых выбирают (Общий есть у всех). */
export function languageOptions(content: Content): string[] {
  return content.languages.filter((l) => !l.rare && l.id !== 'common').map((l) => l.id);
}

/** Умения классов персонажа, которые дают языки (плут: «Воровской жаргон»; друид: «Друидический»). */
function languageFeatureIds(c: Character, content: Content): string[] {
  const classes = indexOf(content).classes;
  return c.classes.flatMap((e) =>
    (classes.get(e.classId)?.levels.slice(0, e.level) ?? []).flatMap((row) => row.features.filter((id) => FEATURE_LANGUAGES[id])),
  );
}

/** Выборы языков от умений класса: сколько выбрать и из чего (любой язык, которого ещё нет). */
export function featureLanguageSlots(c: Character, content: Content): { featureId: string; key: string; choose: number; options: string[] }[] {
  return languageFeatureIds(c, content)
    .filter((id) => FEATURE_LANGUAGES[id].choose > 0)
    .map((featureId) => {
      const key = CHOICE_KEYS.featureLanguages(featureId);
      const own = new Set(c.choices[key] ?? []);
      const known = new Set(knownLanguages(c, content));
      return {
        featureId,
        key,
        choose: FEATURE_LANGUAGES[featureId].choose,
        options: content.languages.map((l) => l.id).filter((id) => own.has(id) || !known.has(id)),
      };
    });
}

/** Все языки персонажа: Общий, выбранные, от умений класса (даны и выбраны). */
export function knownLanguages(c: Character, content: Content): string[] {
  const ids = new Set(['common', ...c.languages]);
  for (const featureId of languageFeatureIds(c, content)) {
    for (const id of FEATURE_LANGUAGES[featureId].known) ids.add(id);
    for (const id of c.choices[CHOICE_KEYS.featureLanguages(featureId)] ?? []) ids.add(id);
  }
  // Порядок — как в справочнике; языки, которых в справочнике нет (из файла другой версии), — в конце.
  const ordered = content.languages.map((l) => l.id).filter((id) => ids.has(id));
  return [...ordered, ...[...ids].filter((id) => !ordered.includes(id))];
}

// ---------- Шаг 5: снаряжение ----------

export function equipmentChoice(c: Character, content: Content, source: EquipmentSource): Choice | undefined {
  if (source === 'class') return startingClass(c, content)?.startingEquipment[0];
  return indexOf(content).backgrounds.get(c.backgroundId)?.equipment[0];
}

/** Вложенные выборы внутри варианта набора («священный символ на выбор»): индекс → варианты. */
export function equipmentPicks(option: ChoiceOption | undefined, content: Content): { index: number; options: string[] }[] {
  if (option?.kind !== 'all') return [];
  return option.items.flatMap((item, index) =>
    item.kind === 'choice' ? [{ index, options: choiceOptionIds(item.choice, content) }] : [],
  );
}

/** Предметы и монеты из выбранных вариантов стартового снаряжения класса и предыстории. */
export function startingKit(c: Character, content: Content): { items: InventoryItem[]; coins: Partial<Record<Coin, number>> } {
  const counts = new Map<string, number>();
  const coins: Partial<Record<Coin, number>> = {};
  const add = (id: string, n: number) => counts.set(id, (counts.get(id) ?? 0) + n);

  for (const source of ['class', 'background'] as const) {
    const choice = equipmentChoice(c, content, source);
    const chosen = choice1(c, CHOICE_KEYS.equipment(source));
    const option = chosen === undefined ? undefined : choice?.options?.[Number(chosen)];
    if (!option) continue;
    const items = option.kind === 'all' ? option.items : [option];
    items.forEach((item, i) => {
      if (item.kind === 'item') add(item.id, item.count);
      else if (item.kind === 'money') coins[item.unit] = (coins[item.unit] ?? 0) + item.amount;
      else if (item.kind === 'choice') {
        const pick = choice1(c, CHOICE_KEYS.equipmentPick(source, i));
        if (pick) add(pick, 1);
      }
    });
  }

  // Надеваем первый доспех и щит из набора — от них зависит КЗ.
  let armorOn = false;
  let shieldOn = false;
  const items = [...counts].map(([itemId, quantity]): InventoryItem => {
    const armor = indexOf(content).equipment.get(itemId)?.armor;
    let equipped = false;
    if (armor?.category === 'shield' && !shieldOn) equipped = shieldOn = true;
    else if (armor && armor.category !== 'shield' && !armorOn) equipped = armorOn = true;
    return equipped ? { itemId, quantity, equipped } : { itemId, quantity };
  });
  return { items, coins };
}

// ---------- Шаг 5: заклинания ----------

/** Основной заклинатель: первый по порядку класс с заклинаниями. Его заклинания — в `cantrips` / `preparedSpells`. */
export function primaryCasterId(c: Character, content: Content): string | undefined {
  const classes = indexOf(content).classes;
  return c.classes.find((e) => classes.get(e.classId)?.spellcasting)?.classId;
}

/** Заговоры и подготовленные заклинания класса (у основного заклинателя — общие поля персонажа). */
export function classSpellLists(c: Character, content: Content, classId: string): { cantrips: string[]; preparedSpells: string[] } {
  if (classId === primaryCasterId(c, content)) return { cantrips: c.cantrips, preparedSpells: c.preparedSpells };
  const e = c.classes.find((x) => x.classId === classId);
  return { cantrips: e?.cantrips ?? [], preparedSpells: e?.preparedSpells ?? [] };
}

/** Записать заговоры / подготовленные заклинания класса. */
export function setClassSpellLists(
  c: Character,
  content: Content,
  classId: string,
  patch: Partial<{ cantrips: string[]; preparedSpells: string[] }>,
): Character {
  if (classId === primaryCasterId(c, content)) return { ...c, ...patch };
  return { ...c, classes: c.classes.map((e) => (e.classId === classId ? { ...e, ...patch } : e)) };
}

/**
 * Сколько заговоров и подготовленных заклинаний у класса на его уровне — как у одноклассового (SRD 5.2:
 * «Spells Prepared»). По умолчанию — основной заклинатель. null — у класса пока нет заклинаний.
 */
export function spellLimits(c: Character, content: Content, classId = primaryCasterId(c, content)): SpellLimits | null {
  const entry = c.classes.find((e) => e.classId === classId);
  const cls = entry && indexOf(content).classes.get(entry.classId);
  if (!entry || !cls) return null;
  const sc = cls.levels[entry.level - 1]?.spellcasting;
  if (!sc || (cls.spellcasting?.fromLevel ?? 99) > entry.level) return null;
  let cantrips = sc.cantrips;
  // «Божественный порядок» и т.п.: дополнительные заговоры у класса, которому принадлежит умение.
  for (const [featureId, options] of Object.entries(FEATURE_OPTIONS)) {
    if (!featureId.startsWith(`${cls.id}-`)) continue;
    const chosen = choice1(c, CHOICE_KEYS.featureOption(featureId));
    cantrips += options.find((o) => o.id === chosen)?.extraCantrips ?? 0;
  }
  const maxSpellLevel = sc.slots.reduce((max, n, i) => (n > 0 ? i + 1 : max), 0);
  return { classId: cls.id, cantrips, prepared: sc.prepared, maxSpellLevel };
}

/** Заклинания списка класса указанного круга (0 — заговоры). */
export function spellOptions(classId: string, level: number, content: Content): string[] {
  return content.spells.filter((s) => s.level === level && s.classes.includes(classId)).map((s) => s.id);
}

/** Черты «Посвящённый в магию» и список заклинаний для каждой (у предыстории список задан). */
export function magicInitiateSlots(c: Character, content: Content): { slot: OriginFeatSlot; fixedList?: string }[] {
  return originFeats(c, content)
    .filter((f) => f.featId === 'magic-initiate')
    .map((f) => ({
      slot: f.slot,
      fixedList: f.slot === 'bgfeat' ? indexOf(content).backgrounds.get(c.backgroundId)?.featSpellList : undefined,
    }));
}

// ---------- Проверка ----------

/** Значения бонусов предыстории по выбранной схеме. */
export function backgroundBonusPattern(bonuses: Partial<Record<AbilityId, number>>): '2-1' | '1-1-1' {
  return Object.values(bonuses).filter((v) => v === 1).length === 3 ? '1-1-1' : '2-1';
}
