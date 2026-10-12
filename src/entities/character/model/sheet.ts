// Сборка всех производных чисел персонажа из его выборов и справочника.

import type { Content, Equipment } from '@/shared/content';
import { indexOf } from '@/shared/content';
import { t } from '@/shared/i18n/model';

import { ABILITY_IDS, CHOICE_KEYS } from '../config/constants';
import { abilityModifier, addIncrease, applyIncreases, modifiers, proficiencyBonus } from './abilities';
import { totalLevel } from './character';
import { passiveScore, savingThrow, skillBonus } from './checks';
import { chosenProficiencyIds, featureOptionEffects, featureOptionProficiencies } from './choices';
import { armorClass, bonusHpFromEffects, initiative, maxHitPoints, weaponAttack } from './combat';
import { effectsOf } from './effects';
import { characterSpellSlots, spellAttackBonus, spellSaveDC } from './spells';
import type { AbilityScores, Character, CharacterSheet, Effect, SourcedId, WeaponAttack } from './types';

function need<T>(map: ReadonlyMap<string, T>, id: string, what: 'background' | 'species' | 'subspecies' | 'class' | 'subclass'): T {
  const x = map.get(id);
  if (!x) throw new Error(t('contentError.unknown', { what: t(`contentError.${what}`), id }));
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
  const background = need(idx.backgrounds, c.backgroundId, 'background');
  const species = need(idx.species, c.speciesId, 'species');
  const subspecies = c.subspeciesId ? need(idx.subspecies, c.subspeciesId, 'subspecies') : undefined;
  const classes = c.classes.map((e) => ({ entry: e, cls: need(idx.classes, e.classId, 'class') }));

  // --- Умения, особенности, черты ---
  const features: SourcedId[] = [];
  const classLevels: Record<string, number> = {};
  for (const { entry, cls } of classes) {
    classLevels[cls.id] = entry.level;
    for (const row of cls.levels.slice(0, entry.level)) {
      for (const id of row.features) features.push({ id, source: 'class' });
    }
    if (entry.subclassId) {
      const sub = need(idx.subclasses, entry.subclassId, 'subclass');
      for (const id of sub.features) {
        if ((idx.features.get(id)?.level ?? 99) <= entry.level) features.push({ id, source: 'subclass' });
      }
    }
  }
  for (const id of species.traits) features.push({ id, source: 'species' });
  for (const t of subspecies?.traits ?? []) if (t.level <= level) features.push({ id: t.id, source: 'species' });
  for (const id of [...originFeatIds(c, content), ...c.feats.map((f) => f.featId)]) features.push({ id, source: 'feat' });
  const effects = [...effectsOf(features.map((f) => f.id)), ...featureOptionEffects(c)];

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
    const extra = skillExtraBonus(s.id, mods, effects);
    return { id: s.id, ability: s.ability, bonus: skillBonus(mods[s.ability], proficient, exp, pb) + extra, extra, proficient, expertise: exp };
  });
  const perception = skills.find((s) => s.id === 'perception')?.bonus ?? mods.wis;

  // --- Снаряжение, КЗ, атаки ---
  const equipped = c.equipment.filter((i) => i.equipped).map((i) => idx.equipment.get(i.itemId)).filter(Boolean) as Equipment[];
  const armorItem = equipped.find((e) => e.armor && e.armor.category !== 'shield');
  const shieldItem = equipped.find((e) => e.armor?.category === 'shield');
  const ac = armorClass({ armor: armorItem?.armor, shield: shieldItem?.armor, mods, effects });

  // Ярость: бонус к урону из таблицы варвара, пока персонаж в ярости.
  const barbarian = classes.find(({ cls }) => cls.id === 'barbarian');
  const rageBonus = barbarian?.cls.levels[barbarian.entry.level - 1]?.classSpecific?.rage_damage_bonus;
  const rageDamage = c.state.raging && typeof rageBonus === 'number' ? rageBonus : 0;
  const attackOpts = {
    rangedAttackBonus: sumEffects(effects, 'rangedAttackBonus'),
    strengthDamageBonus: rageDamage,
    greatWeaponMinDie: effects.find((e) => e.type === 'greatWeaponMinDie')?.value,
  };
  const attacks: WeaponAttack[] = [];
  const seen = new Set<string>();
  for (const inv of c.equipment) {
    const item = idx.equipment.get(inv.itemId);
    if (!item?.weapon) continue;
    const attack = weaponAttack(item, mods, pb, isProficient(item), { ...attackOpts, magicBonus: inv.magicBonus });
    if (!attack || seen.has(attack.key)) continue;
    seen.add(attack.key);
    attacks.push(attack);
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
  for (const f of features) {
    const traitSpeed = f.source === 'species' ? idx.traits.get(f.id)?.speed : undefined;
    if (traitSpeed) speed = Math.max(speed, traitSpeed);
  }
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
    rageDamage,
    spellcasting,
    classSpecific,
    features,
    proficiencies: [...profIds],
  };
}

function sumEffects(effects: Effect[], type: 'rangedAttackBonus'): number {
  let sum = 0;
  for (const e of effects) if (e.type === type) sum += e.value;
  return sum;
}

/** Бонус к навыку от эффектов («Чудотворец»: + мод. МДР к Магии и Религии, минимум +1). */
function skillExtraBonus(skillId: string, mods: AbilityScores, effects: Effect[]): number {
  let sum = 0;
  for (const e of effects) if (e.type === 'skillBonusFromAbility' && e.skills.includes(skillId)) sum += Math.max(e.min, mods[e.ability]);
  return sum;
}
