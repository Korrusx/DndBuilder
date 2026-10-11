// Сборка всех производных чисел персонажа из его выборов и справочника.

import type { AbilityId, CharacterClass, Content, Equipment } from '@/content/types';
import { abilityModifier, addIncrease, applyIncreases, modifiers, proficiencyBonus } from './abilities';
import { ABILITY_IDS, totalLevel, type AbilityScores, type Character } from './character';
import { passiveScore, savingThrow, skillBonus } from './checks';
import { CHOICE_KEYS, chosenProficiencyIds, featureOptionProficiencies } from './choices';
import { armorClass, bonusHpFromEffects, initiative, maxHitPoints, weaponAttack, type WeaponAttack } from './combat';
import { effectsOf } from './effects';
import { characterSpellSlots, spellAttackBonus, spellSaveDC } from './spells';

export type SourcedId = { id: string; source: 'class' | 'subclass' | 'species' | 'feat' };

export type CharacterSheet = {
  level: number;
  profBonus: number;
  abilities: Record<AbilityId, { score: number; mod: number; save: number; saveProficient: boolean }>;
  skills: { id: string; ability: AbilityId; bonus: number; proficient: boolean; expertise: boolean }[];
  passivePerception: number;
  initiative: number;
  maxHp: number;
  armorClass: number;
  speed: number;
  hitDice: { classId: string; die: number; total: number }[];
  attacks: WeaponAttack[];
  spellcasting?: { classId: string; ability: AbilityId; saveDC: number; attackBonus: number; slots: number[] };
  /** Особые столбцы таблицы класса на текущем уровне (скрытая атака, ярость…). */
  classSpecific: Record<string, Record<string, unknown>>;
  /** Умения класса/подкласса, особенности вида и черты — для «Что умеет». */
  features: SourcedId[];
  /** id владений (proficiencies). */
  proficiencies: string[];
};

type Index = {
  classes: Map<string, CharacterClass>;
  equipment: Map<string, Equipment>;
  [key: string]: Map<string, any>;
};

const indexCache = new WeakMap<Content, Index>();

function indexOf(content: Content): Index {
  let idx = indexCache.get(content);
  if (!idx) {
    const by = <T extends { id: string }>(xs: T[]) => new Map(xs.map((x) => [x.id, x]));
    idx = {
      classes: by(content.classes),
      equipment: by(content.equipment),
      subclasses: by(content.subclasses),
      features: by(content.features),
      species: by(content.species),
      subspecies: by(content.subspecies),
      traits: by(content.traits),
      backgrounds: by(content.backgrounds),
      proficiencies: by(content.proficiencies),
    };
    indexCache.set(content, idx);
  }
  return idx;
}

function need<T>(map: Map<string, T>, id: string, what: string): T {
  const x = map.get(id);
  if (!x) throw new Error(`Неизвестный ${what}: ${id}`);
  return x;
}

export function finalAbilityScores(c: Character): AbilityScores {
  const withBackground = applyIncreases(c.baseAbilities, c.backgroundBonuses);
  return c.feats.reduce((scores, f) => addIncrease(scores, f.abilityIncreases ?? {}, f.abilityCap), withBackground);
}

/** id всех владений персонажа: класс, предыстория, выборы мастера, варианты умений. */
export function proficiencyIds(c: Character, content: Content): Set<string> {
  const idx = indexOf(content);
  const background = idx.backgrounds.get(c.backgroundId);
  return new Set<string>([
    // Стартовый класс даёт все свои владения, остальные — владения для мультикласса.
    ...c.classes.flatMap((e, i) => {
      const cls = idx.classes.get(e.classId);
      return (i === 0 ? cls?.proficiencies : cls?.multiclass.proficiencies) ?? [];
    }),
    ...(background?.proficiencies ?? []),
    ...c.toolProficiencies,
    ...chosenProficiencyIds(c),
    ...featureOptionProficiencies(c),
  ]);
}

/** Проверка владения предметом (оружием, доспехом) по набору владений. */
export function makeProficiencyCheck(profIds: Set<string>, content: Content): (item: Equipment) => boolean {
  const idx = indexOf(content);
  const refs = new Set<string>();
  for (const id of profIds) {
    const ref = idx.proficiencies.get(id)?.refId;
    if (ref) refs.add(ref);
  }
  return (item) => refs.has(item.id) || item.categories.some((cat) => refs.has(cat));
}

/** Черты происхождения: черта предыстории и черта от «Универсальности» человека. */
export function originFeatIds(c: Character, content: Content): string[] {
  const background = indexOf(content).backgrounds.get(c.backgroundId);
  return [background?.featId, ...(c.choices[CHOICE_KEYS.versatileFeat] ?? [])].filter((x): x is string => !!x);
}

export function computeSheet(c: Character, content: Content): CharacterSheet {
  const idx = indexOf(content);
  const level = totalLevel(c.classes);
  const pb = proficiencyBonus(level);
  const background = need(idx.backgrounds, c.backgroundId, 'предыстория');
  const species = need(idx.species, c.speciesId, 'вид');
  const subspecies = c.subspeciesId ? need(idx.subspecies, c.subspeciesId, 'подвид') : undefined;
  const classes = c.classes.map((e) => ({ entry: e, cls: need(idx.classes, e.classId, 'класс') }));

  // --- Умения, особенности, черты ---
  const features: SourcedId[] = [];
  const classLevels: Record<string, number> = {};
  for (const { entry, cls } of classes) {
    classLevels[cls.id] = entry.level;
    for (const row of cls.levels.slice(0, entry.level)) {
      for (const id of row.features) features.push({ id, source: 'class' });
    }
    if (entry.subclassId) {
      const sub = need(idx.subclasses, entry.subclassId, 'подкласс');
      for (const id of sub.features) {
        if ((idx.features.get(id)?.level ?? 99) <= entry.level) features.push({ id, source: 'subclass' });
      }
    }
  }
  for (const id of species.traits) features.push({ id, source: 'species' });
  for (const t of subspecies?.traits ?? []) if (t.level <= level) features.push({ id: t.id, source: 'species' });
  for (const id of [...originFeatIds(c, content), ...c.feats.map((f) => f.featId)]) features.push({ id, source: 'feat' });
  const effects = effectsOf(features.map((f) => f.id));

  // --- Характеристики и спасброски ---
  const scores = finalAbilityScores(c);
  const mods = modifiers(scores);
  const saveProfs = new Set(classes[0]?.cls.savingThrows ?? []);
  const abilities = {} as CharacterSheet['abilities'];
  for (const id of ABILITY_IDS) {
    const proficient = saveProfs.has(id);
    abilities[id] = { score: scores[id], mod: mods[id], save: savingThrow(mods[id], proficient, pb), saveProficient: proficient };
  }

  // --- Владения ---
  const profIds = proficiencyIds(c, content);
  const isProficient = makeProficiencyCheck(profIds, content);

  // --- Навыки ---
  const skillProfs = new Set<string>(c.skillProficiencies);
  for (const id of profIds) {
    const p = idx.proficiencies.get(id);
    if (p?.type === 'skill' && p.refId) skillProfs.add(p.refId);
  }
  const expertise = new Set(c.expertise);
  const skills = content.skills.map((s) => {
    const proficient = skillProfs.has(s.id);
    const exp = proficient && expertise.has(s.id);
    return { id: s.id, ability: s.ability, bonus: skillBonus(mods[s.ability], proficient, exp, pb), proficient, expertise: exp };
  });
  const perception = skills.find((s) => s.id === 'perception')?.bonus ?? mods.wis;

  // --- Снаряжение, КЗ, атаки ---
  const equipped = c.equipment.filter((i) => i.equipped).map((i) => idx.equipment.get(i.itemId)).filter(Boolean) as Equipment[];
  const armorItem = equipped.find((e) => e.armor && e.armor.category !== 'shield');
  const shieldItem = equipped.find((e) => e.armor?.category === 'shield');
  const ac = armorClass({ armor: armorItem?.armor, shield: shieldItem?.armor, mods, effects });

  const attacks: WeaponAttack[] = [];
  const seen = new Set<string>();
  for (const inv of c.equipment) {
    const item = idx.equipment.get(inv.itemId);
    if (!item?.weapon || seen.has(item.id)) continue;
    seen.add(item.id);
    const attack = weaponAttack(item, mods, pb, isProficient(item));
    if (attack) attacks.push(attack);
  }

  // --- Хиты ---
  const hitDice = classes.map(({ entry, cls }) => ({ classId: cls.id, die: cls.hitDie, total: entry.level }));
  const maxHp = maxHitPoints(
    hitDice.map((h) => ({ hitDie: h.die, level: h.total })),
    abilityModifier(scores.con),
    bonusHpFromEffects(effects, level, classLevels),
  );

  // --- Скорость ---
  let speed = species.speed;
  const traitIds = new Set(features.filter((f) => f.source === 'species').map((f) => f.id));
  for (const t of content.traits) if (t.speed && traitIds.has(t.id)) speed = Math.max(speed, t.speed);
  const classSpecific: CharacterSheet['classSpecific'] = {};
  for (const { entry, cls } of classes) {
    const row = cls.levels[entry.level - 1];
    if (row?.classSpecific) classSpecific[cls.id] = row.classSpecific;
  }
  if (!armorItem && !shieldItem) {
    for (const e of effects) {
      if (e.type !== 'unarmoredSpeedFromClassTable') continue;
      const bonus = classSpecific[e.classId]?.[e.column];
      if (typeof bonus === 'number') speed += bonus;
    }
  }

  // --- Заклинания ---
  let spellcasting: CharacterSheet['spellcasting'];
  const caster = classes.find(({ entry, cls }) => cls.spellcasting && entry.level >= cls.spellcasting.fromLevel);
  if (caster?.cls.spellcasting) {
    const ability = caster.cls.spellcasting.ability;
    spellcasting = {
      classId: caster.cls.id,
      ability,
      saveDC: spellSaveDC(mods[ability], pb),
      attackBonus: spellAttackBonus(mods[ability], pb),
      slots: characterSpellSlots(c.classes, idx.classes),
    };
  }

  return {
    level,
    profBonus: pb,
    abilities,
    skills,
    passivePerception: passiveScore(perception),
    initiative: initiative(mods.dex, pb, effects),
    maxHp,
    armorClass: ac,
    speed,
    hitDice,
    attacks,
    spellcasting,
    classSpecific,
    features,
    proficiencies: [...profIds],
  };
}
