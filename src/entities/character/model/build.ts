// Мастер создания персонажа 1-го уровня: какие выборы нужно сделать, что из них следует,
// и чего не хватает, чтобы персонаж был готов. Чистые функции, без React и базы.

import type { AbilityId, Choice, ChoiceOption, Coin, Content, Edition } from '@/shared/content';
import { indexOf } from '@/shared/content';
import {
  CHOICE_KEYS,
  FEAT_FEATURES,
  FEATURE_LANGUAGES,
  FEATURE_OPTIONS,
  SPELLCASTER_PROGRESSION,
  STANDARD_LANGUAGE_COUNT,
} from '../config/constants';
import { newDraftCharacter } from './character';
import { choice1 } from './choices';
import { abilityModifier } from './abilities';
import { classFeatureIdsAt, finalAbilityScores, makeProficiencyCheck, proficiencyIds, raceTraitIds } from './sheet';
import type {
  Character,
  EquipmentSource,
  InventoryItem,
  OriginFeat,
  OriginFeatSlot,
  ProficiencySlot,
  SlotId,
  SpellLimits,
} from './types';

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
    if (o.kind === 'ref' || o.kind === 'item') {
      return [o.id];
    }
    if (o.kind === 'choice') {
      return choiceOptionIds(o.choice, content);
    }
    return [];
  });
  return [...new Set([...fromCategory, ...fromOptions])];
}

// ---------- Редакция ----------

/** Смена редакции: выборы другой редакции не подходят (другие id и правила) — черновик начинается заново, имя остаётся. */
export function setEdition(c: Character, edition: Edition): Character {
  if (c.edition === edition) {
    return c;
  }
  const fresh = newDraftCharacter(c.id, c.createdAt, edition);
  return { ...fresh, name: c.name, player: c.player, notes: c.notes, campaign: c.campaign, updatedAt: c.updatedAt };
}

/** С какого уровня класса выбирается подкласс (2024 — с 3-го у всех; 2014 — жрец, чародей, колдун с 1-го). */
export function subclassLevel(classId: string, content: Content): number {
  const idx = indexOf(content);
  const levels = (idx.classes.get(classId)?.subclasses ?? []).flatMap((id) =>
    (idx.subclasses.get(id)?.features ?? []).map((f) => idx.features.get(f)?.level ?? 99),
  );
  return levels.length ? Math.min(...levels) : 3;
}

export function setSubclass(c: Character, subclassId: string): Character {
  const [first, ...rest] = c.classes;
  if (!first || first.subclassId === subclassId) {
    return c;
  }
  // Варианты умений прежнего подкласса (драконий предок) больше не нужны.
  return { ...c, classes: [{ ...first, subclassId }, ...rest], choices: dropChoices(c.choices, ['feature.']) };
}

// ---------- Смена класса, предыстории, вида ----------

/** Убирает выборы, ключи которых начинаются с указанных префиксов. */
function dropChoices(choices: Record<string, string[]>, prefixes: string[]): Record<string, string[]> {
  return Object.fromEntries(Object.entries(choices).filter(([k]) => !prefixes.some((p) => k.startsWith(p))));
}

/** Выбор класса сбрасывает всё, что от него зависело. */
export function setClass(c: Character, classId: string): Character {
  if (c.classes[0]?.classId === classId) {
    return c;
  }
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
  if (c.backgroundId === backgroundId) {
    return c;
  }
  return {
    ...c,
    backgroundId,
    backgroundBonuses: {},
    choices: dropChoices(c.choices, ['background.', 'bgfeat.', 'equip.background']),
    expertise: [],
  };
}

export function setSpecies(c: Character, speciesId: string, content: Content): Character {
  if (c.speciesId === speciesId) {
    return c;
  }
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
  // В 2014 предыстория черты не даёт.
  if (background?.featId) {
    out.push({ slot: 'bgfeat', featId: background.featId, source: 'background' });
  }
  const species = indexOf(content).species.get(c.speciesId);
  // 2024: человек, «Универсальность»; 2014: человек-вариант — черта на 1-м уровне.
  if (species?.traits.some((id) => id === 'versatile' || id === 'variant-human-feat')) {
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
    slots.push({
      key: CHOICE_KEYS.classProf(cls.id, i),
      source: 'class',
      desc: ch.desc,
      choose: ch.choose,
      options: choiceOptionIds(ch, content),
    }),
  );
  const background = indexOf(content).backgrounds.get(c.backgroundId);
  background?.proficiencyChoices.forEach((ch, i) =>
    slots.push({
      key: CHOICE_KEYS.backgroundProf(background.id, i),
      source: 'background',
      desc: ch.desc,
      choose: ch.choose,
      options: choiceOptionIds(ch, content),
    }),
  );
  // 2014: умения 1-го уровня класса и подкласса с владениями на выбор (домен знаний, домен природы).
  const first = c.classes[0];
  for (const featureId of first ? classFeatureIdsAt({ ...first, level: 1 }, content) : []) {
    indexOf(content)
      .features.get(featureId)
      ?.proficiencyChoices?.forEach((ch, i) =>
        slots.push({
          key: `feature.${featureId}.prof.${i}`,
          source: 'class',
          desc: ch.desc,
          choose: ch.choose,
          options: choiceOptionIds(ch, content),
        }),
      );
  }
  for (const traitId of speciesTraitIds(c, content)) {
    indexOf(content)
      .traits.get(traitId)
      ?.proficiencyChoices?.forEach((ch, i) =>
        slots.push({
          key: CHOICE_KEYS.traitProf(traitId, i),
          source: 'species',
          desc: ch.desc,
          choose: ch.choose,
          options: choiceOptionIds(ch, content),
        }),
      );
  }
  for (const f of originFeats(c, content)) {
    // Владения на выбор из данных черты («Ремесленник», «Музыкант»).
    (f.featId ? indexOf(content).feats.get(f.featId) : undefined)?.proficiencyChoices?.forEach((ch, i) =>
      slots.push({
        key: `${CHOICE_KEYS.featProf(f.slot)}.${i}`,
        source: 'feat',
        desc: ch.desc,
        choose: ch.choose,
        options: choiceOptionIds(ch, content),
      }),
    );
    // Черта «Одарённый»: любые три навыка или инструмента.
    if (f.featId !== 'skilled') {
      continue;
    }
    const options = content.proficiencies
      .filter((p) => ['skill', 'tool', 'artisanTool', 'instrument'].includes(p.type))
      .map((p) => p.id);
    slots.push({
      key: CHOICE_KEYS.featProf(f.slot),
      source: 'feat',
      desc: { en: 'Skilled: three skills or tools', ru: 'Одарённый: три навыка или инструмента' },
      choose: 3,
      options,
    });
  }
  return slots;
}

function speciesTraitIds(c: Character, content: Content): string[] {
  const species = indexOf(content).species.get(c.speciesId);
  const sub = c.subspeciesId ? indexOf(content).subspecies.get(c.subspeciesId) : undefined;
  return raceTraitIds(species, sub, 1);
}

/** Владения, которые даются без выбора (класс, предыстория, особенности расы 2014). Их нельзя выбрать ещё раз. */
export function fixedProficiencies(
  c: Character,
  content: Content,
): { id: string; source: 'class' | 'background' | 'species' }[] {
  const cls = startingClass(c, content);
  const idx = indexOf(content);
  const background = idx.backgrounds.get(c.backgroundId);
  return [
    ...(cls?.proficiencies ?? []).map((id) => ({ id, source: 'class' as const })),
    ...(background?.proficiencies ?? []).map((id) => ({ id, source: 'background' as const })),
    ...speciesTraitIds(c, content).flatMap((t) =>
      (idx.traits.get(t)?.proficiencies ?? []).map((id) => ({ id, source: 'species' as const })),
    ),
  ];
}

/** Особенности расы / вида 1-го уровня (с подрасой / подвидом). */
export function originTraitIds(c: Character, content: Content): string[] {
  return speciesTraitIds(c, content);
}

/**
 * 2014: варианты умений 1-го уровня (класс и подкласс 1-го уровня): боевой стиль, драконий предок.
 * Ключ выбора — CHOICE_KEYS.featureOption(featureId), значения — id умений-вариантов.
 */
export function featureChoices(
  c: Character,
  content: Content,
): { featureId: string; choose: number; options: string[] }[] {
  const idx = indexOf(content);
  const first = c.classes[0];
  const cls = first && idx.classes.get(first.classId);
  if (!cls) {
    return [];
  }
  const sub = first.subclassId ? idx.subclasses.get(first.subclassId) : undefined;
  const ids = [
    ...(cls.levels[0]?.features ?? []),
    ...(sub?.features ?? []).filter((id) => idx.features.get(id)?.level === 1),
  ];
  return ids.flatMap((featureId) => {
    const choice = idx.features.get(featureId)?.optionChoice;
    return choice ? [{ featureId, choose: choice.choose, options: choiceOptionIds(choice, content) }] : [];
  });
}

/** Сколько языков выбирает игрок: 2024 — два стандартных; 2014 — сколько дают раса, её особенности и предыстория. */
export function languageChoiceCount(c: Character, content: Content): number {
  if (content.edition !== '2014') {
    return STANDARD_LANGUAGE_COUNT;
  }
  const idx = indexOf(content);
  const species = idx.species.get(c.speciesId);
  const background = idx.backgrounds.get(c.backgroundId);
  const traits = speciesTraitIds(c, content).map((id) => idx.traits.get(id)?.languageChoice?.choose ?? 0);
  return (
    (species?.languageChoice?.choose ?? 0) +
    (background?.languageChoice?.choose ?? 0) +
    traits.reduce((a, b) => a + b, 0)
  );
}

/** Из каких языков выбирать: 2024 — стандартные; 2014 — любые, кроме уже известных от расы. */
export function languageChoiceOptions(c: Character, content: Content): string[] {
  if (content.edition !== '2014') {
    return languageOptions(content);
  }
  const own = new Set(['common', ...(indexOf(content).species.get(c.speciesId)?.languages ?? [])]);
  return content.languages.map((l) => l.id).filter((id) => !own.has(id));
}

/** Навыки (id навыков), которыми персонаж владеет — для выбора компетентности. */
export function proficientSkills(c: Character, content: Content): string[] {
  const idx = indexOf(content);
  const skills = new Set(c.skillProficiencies);
  for (const id of proficiencyIds(c, content)) {
    const p = idx.proficiencies.get(id);
    if (p?.type === 'skill' && p.refId) {
      skills.add(p.refId);
    }
  }
  return content.skills.map((s) => s.id).filter((id) => skills.has(id));
}

/** Сколько навыков с компетентностью даёт класс на 1-м уровне (плут: 2). */
export function expertiseCount(c: Character, content: Content): number {
  const cls = startingClass(c, content);
  const features = indexOf(content).features;
  // 2024: умение «…-expertise»; 2014: умение с выбором компетентности («rogue-expertise-1»).
  return cls?.levels[0]?.features.some((id) => id.endsWith('-expertise') || features.get(id)?.expertiseChoice) ? 2 : 0;
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
    if (!rows.some((r) => r.features.some((id) => id.endsWith('-weapon-mastery')))) {
      return [];
    }
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
  // Таблицы умений 2024; в 2014 варианты умений — featureChoices.
  if (content.edition === '2014') {
    return [];
  }
  return (cls?.levels[0]?.features ?? []).filter((id) => FEATURE_OPTIONS[id]);
}

/** Умения 1-го уровня, которые дают черту (воин: «Боевой стиль»). */
export function featFeatureIds(c: Character, content: Content): string[] {
  const cls = startingClass(c, content);
  // 2014: боевой стиль — вариант умения (featureChoices), а не черта.
  if (content.edition === '2014') {
    return [];
  }
  return (cls?.levels[0]?.features ?? []).filter((id) => FEAT_FEATURES[id]);
}

/** Стандартные языки, из которых выбирают (Общий есть у всех). */
export function languageOptions(content: Content): string[] {
  return content.languages.filter((l) => !l.rare && l.id !== 'common').map((l) => l.id);
}

/** Умения классов персонажа, которые дают языки (плут: «Воровской жаргон»; друид: «Друидический»). */
function languageFeatureIds(c: Character, content: Content): string[] {
  const classes = indexOf(content).classes;
  if (content.edition === '2014') {
    return [];
  }
  return c.classes.flatMap((e) =>
    (classes.get(e.classId)?.levels.slice(0, e.level) ?? []).flatMap((row) =>
      row.features.filter((id) => FEATURE_LANGUAGES[id]),
    ),
  );
}

/** Выборы языков от умений класса: сколько выбрать и из чего (любой язык, которого ещё нет). */
export function featureLanguageSlots(
  c: Character,
  content: Content,
): { featureId: string; key: string; choose: number; options: string[] }[] {
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

/** Все языки персонажа: Общий, выбранные, от расы (2014), от умений класса (даны и выбраны). */
export function knownLanguages(c: Character, content: Content): string[] {
  const ids = new Set(['common', ...c.languages, ...(indexOf(content).species.get(c.speciesId)?.languages ?? [])]);
  for (const featureId of languageFeatureIds(c, content)) {
    for (const id of FEATURE_LANGUAGES[featureId].known) {
      ids.add(id);
    }
    for (const id of c.choices[CHOICE_KEYS.featureLanguages(featureId)] ?? []) {
      ids.add(id);
    }
  }
  // Порядок — как в справочнике; языки, которых в справочнике нет (из файла другой версии), — в конце.
  const ordered = content.languages.map((l) => l.id).filter((id) => ids.has(id));
  return [...ordered, ...[...ids].filter((id) => !ordered.includes(id))];
}

// ---------- Шаг 5: снаряжение ----------

export function equipmentChoice(c: Character, content: Content, source: EquipmentSource): Choice | undefined {
  return equipmentChoices(c, content, source)[0];
}

/**
 * Все выборы стартового снаряжения класса или предыстории. В 2024 он один (набор A или B), в 2014 — несколько.
 * «Любой предмет из категории» без вариантов превращается в выбор из одного варианта с выбором предмета.
 */
export function equipmentChoices(c: Character, content: Content, source: EquipmentSource): Choice[] {
  const list =
    source === 'class'
      ? startingClass(c, content)?.startingEquipment
      : indexOf(content).backgrounds.get(c.backgroundId)?.equipment;
  return (list ?? []).map((ch) => (ch.options ? ch : { choose: 1, options: [{ kind: 'choice', choice: ch }] }));
}

/** Выбранный вариант: номер из выборов игрока; если вариант один — он и выбран. */
export function chosenEquipmentOption(
  c: Character,
  choice: Choice,
  source: EquipmentSource,
  step: number,
): ChoiceOption | undefined {
  if (choice.options?.length === 1) {
    return choice.options[0];
  }
  const chosen = choice1(c, CHOICE_KEYS.equipment(source, step));
  return chosen === undefined ? undefined : choice.options?.[Number(chosen)];
}

/** Вложенные выборы внутри варианта набора («священный символ на выбор»): индекс → варианты и сколько выбрать. */
export function equipmentPicks(
  option: ChoiceOption | undefined,
  content: Content,
): { index: number; options: string[]; choose: number }[] {
  if (option?.kind === 'choice') {
    return [{ index: 0, options: choiceOptionIds(option.choice, content), choose: option.choice.choose }];
  }
  if (option?.kind !== 'all') {
    return [];
  }
  return option.items.flatMap((item, index) =>
    item.kind === 'choice'
      ? [{ index, options: choiceOptionIds(item.choice, content), choose: item.choice.choose }]
      : [],
  );
}

/** Предметы и монеты из выбранных вариантов стартового снаряжения класса и предыстории. */
export function startingKit(
  c: Character,
  content: Content,
): { items: InventoryItem[]; equippedSlots: Partial<Record<SlotId, string>>; coins: Partial<Record<Coin, number>> } {
  const counts = new Map<string, number>();
  const coins: Partial<Record<Coin, number>> = {};
  const add = (id: string, n: number) => counts.set(id, (counts.get(id) ?? 0) + n);

  for (const source of ['class', 'background'] as const) {
    equipmentChoices(c, content, source).forEach((choice, step) => {
      const option = chosenEquipmentOption(c, choice, source, step);
      if (!option) {
        return;
      }
      const items = option.kind === 'all' ? option.items : [option];
      items.forEach((item, i) => {
        if (item.kind === 'item') {
          add(item.id, item.count);
        } else if (item.kind === 'money') {
          coins[item.unit] = (coins[item.unit] ?? 0) + item.amount;
        } else if (item.kind === 'choice') {
          for (const pick of c.choices[CHOICE_KEYS.equipmentPick(source, i, step)] ?? []) {
            add(pick, 1);
          }
        }
      });
    });
  }

  // Надеваем первый доспех и щит — от них зависит начальный КЗ. Оружие оставляем в рюкзаке.
  const equippedSlots: Partial<Record<SlotId, string>> = {};
  const items = [...counts].map(([itemId, quantity]): InventoryItem => ({ itemId, quantity }));

  for (const [itemId] of counts) {
    const eq = indexOf(content).equipment.get(itemId);
    if (!eq) {
      continue;
    }
    if (eq.armor?.category === 'shield' && !equippedSlots.off) {
      equippedSlots.off = itemId;
    } else if (eq.armor && eq.armor.category !== 'shield' && !equippedSlots.body) {
      equippedSlots.body = itemId;
    }
  }

  // Убираем надетые предметы из рюкзака
  const equippedIds = new Set(Object.values(equippedSlots));
  const bag = items.filter((it) => !equippedIds.has(it.itemId));

  return { items: bag, equippedSlots, coins };
}

// ---------- Шаг 5: заклинания ----------

/** Основной заклинатель: первый по порядку класс с заклинаниями. Его заклинания — в `cantrips` / `preparedSpells`. */
export function primaryCasterId(c: Character, content: Content): string | undefined {
  const classes = indexOf(content).classes;
  return c.classes.find((e) => classes.get(e.classId)?.spellcasting)?.classId;
}

/** Заговоры и подготовленные заклинания класса (у основного заклинателя — общие поля персонажа). */
export function classSpellLists(
  c: Character,
  content: Content,
  classId: string,
): { cantrips: string[]; preparedSpells: string[] } {
  if (classId === primaryCasterId(c, content)) {
    return { cantrips: c.cantrips, preparedSpells: c.preparedSpells };
  }
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
  if (classId === primaryCasterId(c, content)) {
    return { ...c, ...patch };
  }
  return { ...c, classes: c.classes.map((e) => (e.classId === classId ? { ...e, ...patch } : e)) };
}

/**
 * Сколько заговоров и подготовленных заклинаний у класса на его уровне — как у одноклассового (SRD 5.2:
 * «Spells Prepared»). По умолчанию — основной заклинатель. null — у класса пока нет заклинаний.
 * 2014 (SRD 5.1): у бардов, следопытов, чародеев и колдунов — число известных заклинаний по таблице
 * (они лежат в тех же списках, что подготовленные); у жреца, друида и волшебника — мод. характеристики + уровень
 * класса, у паладина — мод. + половина уровня (вниз); не меньше 1.
 */
export function spellLimits(c: Character, content: Content, classId = primaryCasterId(c, content)): SpellLimits | null {
  const entry = c.classes.find((e) => e.classId === classId);
  const cls = entry && indexOf(content).classes.get(entry.classId);
  if (!entry || !cls) {
    return null;
  }
  const sc = cls.levels[entry.level - 1]?.spellcasting;
  if (!sc || (cls.spellcasting?.fromLevel ?? 99) > entry.level) {
    return null;
  }
  let cantrips = sc.cantrips;
  // «Божественный порядок» и т.п.: дополнительные заговоры у класса, которому принадлежит умение.
  for (const [featureId, options] of Object.entries(FEATURE_OPTIONS)) {
    if (!featureId.startsWith(`${cls.id}-`)) {
      continue;
    }
    const chosen = choice1(c, CHOICE_KEYS.featureOption(featureId));
    cantrips += options.find((o) => o.id === chosen)?.extraCantrips ?? 0;
  }
  const maxSpellLevel = sc.slots.reduce((max, n, i) => (n > 0 ? i + 1 : max), 0);
  return { classId: cls.id, cantrips, prepared: preparedCount(c, content, cls.id, entry.level), maxSpellLevel };
}

function preparedCount(c: Character, content: Content, classId: string, level: number): number {
  const cls = indexOf(content).classes.get(classId)!;
  const sc = cls.levels[level - 1]?.spellcasting;
  const preparation = cls.spellcasting?.preparation;
  if (!preparation) {
    return sc?.prepared ?? 0;
  }
  if (preparation === 'known') {
    return sc?.known ?? 0;
  }
  const mod = abilityModifier(finalAbilityScores(c, content)[cls.spellcasting!.ability]);
  return Math.max(1, mod + (SPELLCASTER_PROGRESSION[classId] === 'half' ? Math.floor(level / 2) : level));
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
