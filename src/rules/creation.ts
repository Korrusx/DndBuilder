// Мастер создания персонажа 1-го уровня: какие выборы нужно сделать, что из них следует,
// и чего не хватает, чтобы персонаж был готов. Чистые функции, без React и базы.

import type { AbilityId, Choice, ChoiceOption, Coin, Content, LocalizedText } from '@/content/types';
import {
  isStandardArray,
  POINT_BUY_BUDGET,
  POINT_BUY_MAX,
  POINT_BUY_MIN,
  pointBuySpent,
  validateBackgroundBonuses,
} from './abilities';
import { ABILITY_IDS, type Character, type InventoryItem } from './character';
import {
  BACKGROUND_SPELL_LIST,
  CHOICE_KEYS,
  choice1,
  FEAT_FEATURES,
  FEATURE_OPTIONS,
  STANDARD_LANGUAGE_COUNT,
  type OriginFeatSlot,
} from './choices';
import { computeSheet, makeProficiencyCheck, proficiencyIds } from './sheet';

// ---------- Справочник ----------

const find = <T extends { id: string }>(xs: T[], id: string | undefined) => (id ? xs.find((x) => x.id === id) : undefined);

export function startingClass(c: Character, content: Content) {
  return find(content.classes, c.classes[0]?.classId);
}

/** Варианты выбора одним списком: ссылки, предметы, «любой из категории», вложенные выборы. */
export function choiceOptionIds(choice: Choice, content: Content): string[] {
  const fromCategory = choice.fromCategory
    ? (content.equipmentCategories.find((x) => x.id === choice.fromCategory)?.equipment ?? [])
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
  const species = find(content.species, speciesId);
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

export type OriginFeat = { slot: OriginFeatSlot; featId?: string; source: 'background' | 'species' };

export function originFeats(c: Character, content: Content): OriginFeat[] {
  const out: OriginFeat[] = [];
  const background = find(content.backgrounds, c.backgroundId);
  if (background) out.push({ slot: 'bgfeat', featId: background.featId, source: 'background' });
  const species = find(content.species, c.speciesId);
  if (species?.traits.includes('versatile')) {
    out.push({ slot: 'versatile', featId: choice1(c, CHOICE_KEYS.versatileFeat), source: 'species' });
  }
  return out;
}

// ---------- Шаг 4: владения ----------

export type ProficiencySlot = {
  key: string;
  source: 'class' | 'background' | 'species' | 'feat';
  desc?: LocalizedText;
  choose: number;
  /** id владений. */
  options: string[];
};

/** Все выборы «выберите N владений» для текущего персонажа. */
export function proficiencySlots(c: Character, content: Content): ProficiencySlot[] {
  const slots: ProficiencySlot[] = [];
  const cls = startingClass(c, content);
  cls?.proficiencyChoices.forEach((ch, i) =>
    slots.push({ key: CHOICE_KEYS.classProf(cls.id, i), source: 'class', desc: ch.desc, choose: ch.choose, options: choiceOptionIds(ch, content) }),
  );
  const background = find(content.backgrounds, c.backgroundId);
  background?.proficiencyChoices.forEach((ch, i) =>
    slots.push({ key: CHOICE_KEYS.backgroundProf(background.id, i), source: 'background', desc: ch.desc, choose: ch.choose, options: choiceOptionIds(ch, content) }),
  );
  for (const traitId of speciesTraitIds(c, content)) {
    find(content.traits, traitId)?.proficiencyChoices?.forEach((ch, i) =>
      slots.push({ key: CHOICE_KEYS.traitProf(traitId, i), source: 'species', desc: ch.desc, choose: ch.choose, options: choiceOptionIds(ch, content) }),
    );
  }
  // Черта «Одарённый»: любые три навыка или инструмента.
  for (const f of originFeats(c, content)) {
    if (f.featId !== 'skilled') continue;
    const options = content.proficiencies
      .filter((p) => ['skill', 'tool', 'artisanTool', 'instrument'].includes(p.type))
      .map((p) => p.id);
    slots.push({ key: CHOICE_KEYS.featProf(f.slot), source: 'feat', desc: { en: 'Skilled', ru: 'Одарённый: три навыка или инструмента' }, choose: 3, options });
  }
  return slots;
}

function speciesTraitIds(c: Character, content: Content): string[] {
  const species = find(content.species, c.speciesId);
  const sub = find(content.subspecies, c.subspeciesId);
  return [...(species?.traits ?? []), ...(sub?.traits.filter((t) => t.level <= 1).map((t) => t.id) ?? [])];
}

/** Владения, которые даются без выбора (класс и предыстория). Их нельзя выбрать ещё раз. */
export function fixedProficiencies(c: Character, content: Content): { id: string; source: 'class' | 'background' }[] {
  const cls = startingClass(c, content);
  const background = find(content.backgrounds, c.backgroundId);
  return [
    ...(cls?.proficiencies ?? []).map((id) => ({ id, source: 'class' as const })),
    ...(background?.proficiencies ?? []).map((id) => ({ id, source: 'background' as const })),
  ];
}

/** Навыки (id навыков), которыми персонаж владеет — для выбора компетентности. */
export function proficientSkills(c: Character, content: Content): string[] {
  const profs = proficiencyIds(c, content);
  const fromProfs = content.proficiencies.filter((p) => p.type === 'skill' && profs.has(p.id)).map((p) => p.refId!);
  return content.skills.map((s) => s.id).filter((id) => fromProfs.includes(id) || c.skillProficiencies.includes(id));
}

/** Сколько навыков с компетентностью даёт класс на 1-м уровне (плут: 2). */
export function expertiseCount(c: Character, content: Content): number {
  const cls = startingClass(c, content);
  return cls?.levels[0]?.features.filter((id) => id.endsWith('-expertise')).length ? 2 : 0;
}

/** Сколько видов оружия с приёмами (из таблицы класса; если столбца нет — 2). */
export function weaponMasteryCount(c: Character, content: Content): number {
  const cls = startingClass(c, content);
  if (!cls?.levels[0]?.features.some((id) => id.endsWith('-weapon-mastery'))) return 0;
  const fromTable = cls.levels[0].classSpecific?.weapon_mastery;
  return typeof fromTable === 'number' ? fromTable : 2;
}

/** Оружие, для которого можно выбрать приём: есть приём и есть владение (варвар — только рукопашное). */
export function weaponMasteryOptions(c: Character, content: Content): string[] {
  const cls = startingClass(c, content);
  const proficient = makeProficiencyCheck(proficiencyIds(c, content), content);
  return content.equipment
    .filter((e) => e.weapon?.mastery && proficient(e))
    .filter((e) => cls?.id !== 'barbarian' || e.weapon?.range === 'melee')
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

// ---------- Шаг 5: снаряжение ----------

export type EquipmentSource = 'class' | 'background';

export function equipmentChoice(c: Character, content: Content, source: EquipmentSource): Choice | undefined {
  if (source === 'class') return startingClass(c, content)?.startingEquipment[0];
  return find(content.backgrounds, c.backgroundId)?.equipment[0];
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
    const armor = find(content.equipment, itemId)?.armor;
    let equipped = false;
    if (armor?.category === 'shield' && !shieldOn) equipped = shieldOn = true;
    else if (armor && armor.category !== 'shield' && !armorOn) equipped = armorOn = true;
    return equipped ? { itemId, quantity, equipped } : { itemId, quantity };
  });
  return { items, coins };
}

// ---------- Шаг 5: заклинания ----------

/** Сколько заговоров и подготовленных заклинаний выбирает заклинатель 1-го уровня. */
export function spellLimits(c: Character, content: Content): { classId: string; cantrips: number; prepared: number } | null {
  const cls = startingClass(c, content);
  const sc = cls?.levels[0]?.spellcasting;
  if (!cls || !sc || (cls.spellcasting?.fromLevel ?? 99) > 1) return null;
  let cantrips = sc.cantrips;
  for (const featureId of featureOptionIds(c, content)) {
    const chosen = choice1(c, CHOICE_KEYS.featureOption(featureId));
    cantrips += FEATURE_OPTIONS[featureId].find((o) => o.id === chosen)?.extraCantrips ?? 0;
  }
  return { classId: cls.id, cantrips, prepared: sc.prepared };
}

/** Заклинания списка класса указанного круга (0 — заговоры). */
export function spellOptions(classId: string, level: number, content: Content): string[] {
  return content.spells.filter((s) => s.level === level && s.classes.includes(classId)).map((s) => s.id);
}

/** Черты «Посвящённый в магию» и список заклинаний для каждой (у предыстории список задан). */
export function magicInitiateSlots(c: Character, content: Content): { slot: OriginFeatSlot; fixedList?: string }[] {
  return originFeats(c, content)
    .filter((f) => f.featId === 'magic-initiate')
    .map((f) => ({ slot: f.slot, fixedList: f.slot === 'bgfeat' ? BACKGROUND_SPELL_LIST[c.backgroundId] : undefined }));
}

// ---------- Проверка ----------

export type Issue = {
  step: number;
  message: string;
  /** false — предупреждение, персонажа всё равно можно сохранить. */
  blocking: boolean;
};

const count = (xs: string[] | undefined) => xs?.length ?? 0;

/** Чего не хватает в персонаже, по шагам мастера. Пустой список — можно начинать игру. */
export function draftIssues(c: Character, content: Content): Issue[] {
  const issues: Issue[] = [];
  const need = (step: number, ok: boolean, message: string, blocking = true) => {
    if (!ok) issues.push({ step, message, blocking });
  };

  // 1. Класс
  const cls = startingClass(c, content);
  need(1, !!cls, 'Не выбран класс');

  // 2. Предыстория и вид
  const background = find(content.backgrounds, c.backgroundId);
  const species = find(content.species, c.speciesId);
  need(2, !!background, 'Не выбрана предыстория');
  need(2, !!species, 'Не выбран вид');
  if (species) {
    need(2, species.subspecies.length === 0 || !!c.subspeciesId, 'Не выбрано происхождение вида (родословная, предок)');
    need(2, !!c.size && species.sizes.includes(c.size), 'Не выбран размер');
  }
  for (const f of originFeats(c, content)) {
    if (f.slot === 'versatile') need(2, !!f.featId, 'Не выбрана черта происхождения («Универсальность»)');
  }

  // 3. Характеристики
  const base = c.baseAbilities;
  const values = ABILITY_IDS.map((id) => base[id]);
  if (values.some((v) => !v)) need(3, false, 'Не всем характеристикам назначены значения');
  else if (c.abilityMethod === 'standard') need(3, isStandardArray(base), 'Значения не совпадают со стандартным набором');
  else if (c.abilityMethod === 'pointBuy') {
    const spent = pointBuySpent(base);
    need(3, spent !== undefined && values.every((v) => v >= POINT_BUY_MIN && v <= POINT_BUY_MAX), 'Значения вне диапазона 8–15');
    need(3, spent === undefined || spent <= POINT_BUY_BUDGET, `Потрачено больше ${POINT_BUY_BUDGET} очков`);
  } else {
    const rolls = [...(c.abilityRolls ?? [])].sort().join(',');
    need(3, rolls === [...values].sort().join(','), 'Значения не совпадают с результатами бросков');
  }
  if (background) {
    need(3, validateBackgroundBonuses(c.backgroundBonuses, background.abilities).length === 0, 'Не распределены бонусы предыстории');
  }

  // 4. Навыки и владения
  for (const slot of proficiencySlots(c, content)) {
    need(4, count(c.choices[slot.key]) === slot.choose, `Выберите владения: ${slot.choose} (${sourceName(slot.source)})`);
  }
  const exp = expertiseCount(c, content);
  if (exp) {
    const skills = proficientSkills(c, content);
    need(4, c.expertise.length === exp && c.expertise.every((s) => skills.includes(s)), `Выберите компетентность: ${exp} навыка`);
  }
  const masteries = weaponMasteryCount(c, content);
  if (masteries) need(4, c.weaponMasteries.length === masteries, `Выберите приёмы оружия: ${masteries}`);
  for (const featureId of featureOptionIds(c, content)) {
    need(4, !!choice1(c, CHOICE_KEYS.featureOption(featureId)), 'Не выбран вариант умения класса');
  }
  for (const featureId of featFeatureIds(c, content)) {
    need(4, c.feats.some((f) => f.source === 'class' && find(content.feats, f.featId)?.type === FEAT_FEATURES[featureId]), 'Не выбран боевой стиль');
  }
  need(4, c.languages.filter((l) => l !== 'common').length === STANDARD_LANGUAGE_COUNT, `Выберите языки: ${STANDARD_LANGUAGE_COUNT}`);
  if (cls?.levels[0]?.features.includes('warlock-eldritch-invocations')) {
    need(4, false, 'Таинственные воззвания пока не выбираются в приложении — запишите их в заметки', false);
  }

  // 5. Снаряжение и заклинания
  for (const source of ['class', 'background'] as const) {
    const choice = equipmentChoice(c, content, source);
    if (!choice) continue;
    const chosen = choice1(c, CHOICE_KEYS.equipment(source));
    const option = chosen === undefined ? undefined : choice.options?.[Number(chosen)];
    need(5, !!option, source === 'class' ? 'Не выбрано снаряжение класса' : 'Не выбрано снаряжение предыстории');
    for (const pick of equipmentPicks(option, content)) {
      need(5, !!choice1(c, CHOICE_KEYS.equipmentPick(source, pick.index)), 'Не выбран предмет в наборе снаряжения');
    }
  }
  const limits = spellLimits(c, content);
  if (limits) {
    need(5, c.cantrips.length === limits.cantrips, `Выберите заговоры: ${limits.cantrips}`);
    need(5, c.preparedSpells.length === limits.prepared, `Выберите заклинания 1-го круга: ${limits.prepared}`);
  }
  for (const { slot, fixedList } of magicInitiateSlots(c, content)) {
    const ok =
      !!(fixedList ?? choice1(c, CHOICE_KEYS.featSpellList(slot))) &&
      !!choice1(c, CHOICE_KEYS.featAbility(slot)) &&
      count(c.choices[CHOICE_KEYS.featCantrips(slot)]) === 2 &&
      count(c.choices[CHOICE_KEYS.featSpell(slot)]) === 1;
    need(5, ok, '«Посвящённый в магию»: выберите список, характеристику, 2 заговора и заклинание');
  }

  // 6. Проверка
  need(6, c.name.trim().length > 0, 'Не указано имя');
  return issues;
}

function sourceName(source: ProficiencySlot['source']): string {
  return { class: 'класс', background: 'предыстория', species: 'вид', feat: 'черта' }[source];
}

/** Первый шаг, на котором есть незаполненное (для кнопки «Продолжить»). */
export function firstIncompleteStep(c: Character, content: Content): number {
  const blocking = draftIssues(c, content).filter((i) => i.blocking && i.step < 6);
  return blocking.length ? Math.min(...blocking.map((i) => i.step)) : 6;
}

/** Готовый персонаж: статус «готов», полные хиты. Вызывать только когда нет блокирующих проблем. */
export function finishCharacter(c: Character, content: Content): Character {
  const sheet = computeSheet(c, content);
  return {
    ...c,
    name: c.name.trim(),
    status: { kind: 'ready' },
    state: { ...c.state, currentHp: sheet.maxHp },
  };
}

/** Значения бонусов предыстории по выбранной схеме. */
export function backgroundBonusPattern(bonuses: Partial<Record<AbilityId, number>>): '2-1' | '1-1-1' {
  return Object.values(bonuses).filter((v) => v === 1).length === 3 ? '1-1-1' : '2-1';
}
