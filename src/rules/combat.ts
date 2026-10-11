import type { AbilityId, ArmorInfo, Equipment } from '@/content/types';
import type { AbilityScores } from './character';
import type { Effect } from './effects';

// --- Хиты ---

export type HpLevel = { hitDie: number; level: number };

/**
 * Максимум хитов. Первый элемент — стартовый класс: на 1-м уровне максимум кости хитов,
 * дальше на каждом уровне среднее (кость / 2 + 1). К каждому уровню прибавляется мод. ТЕЛ.
 */
export function maxHitPoints(classes: HpLevel[], conMod: number, bonusHp = 0): number {
  let hp = 0;
  let first = true;
  for (const { hitDie, level } of classes) {
    for (let i = 0; i < level; i++) {
      hp += (first ? hitDie : averageHitDie(hitDie)) + conMod;
      first = false;
    }
  }
  return Math.max(1, hp + bonusHp);
}

/** Прибавка к хитам от эффектов (дварфийская стойкость, драконья устойчивость). */
export function bonusHpFromEffects(effects: Effect[], totalLevel: number, classLevels: Record<string, number>): number {
  let bonus = 0;
  for (const e of effects) {
    if (e.type === 'hpPerLevel') bonus += e.value * totalLevel;
    if (e.type === 'hpPerClassLevel') {
      const lvl = classLevels[e.classId] ?? 0;
      if (lvl >= e.fromLevel) bonus += lvl;
    }
  }
  return bonus;
}

// --- Класс защиты ---

export type AcInput = {
  armor?: ArmorInfo;
  shield?: ArmorInfo;
  mods: AbilityScores;
  effects: Effect[];
};

/**
 * КЗ: без доспеха 10 + ЛОВ (или лучшая из формул «Защиты без доспехов»);
 * лёгкий — база + ЛОВ, средний — база + ЛОВ (не больше +2), тяжёлый — база; щит +2.
 */
export function armorClass({ armor, shield, mods, effects }: AcInput): number {
  let ac: number;
  if (armor) {
    const dex = armor.dexBonus ? Math.min(mods.dex, armor.maxDex ?? Infinity) : 0;
    ac = armor.base + dex;
    for (const e of effects) if (e.type === 'armoredAcBonus') ac += e.value;
  } else {
    ac = 10 + mods.dex;
    for (const e of effects) {
      if (e.type !== 'unarmoredDefense' || (shield && !e.shieldAllowed)) continue;
      ac = Math.max(ac, 10 + e.abilities.reduce((s, id) => s + mods[id], 0));
    }
  }
  if (shield) ac += shield.base;
  return ac;
}

// --- Инициатива ---

export function initiative(dexMod: number, profBonus: number, effects: Effect[]): number {
  const addsPb = effects.some((e) => e.type === 'initiativeAddsProficiency');
  return dexMod + (addsPb ? profBonus : 0);
}

// --- Атаки оружием ---

export type WeaponAttack = {
  itemId: string;
  ability: AbilityId;
  toHit: number;
  damageDice: string;
  damageBonus: number;
  damageType?: string;
  proficient: boolean;
};

/**
 * Атака оружием: мод СИЛ для рукопашного, ЛОВ для дальнобойного,
 * лучший из СИЛ/ЛОВ для фехтовального. + БМ при владении. Урон: кость оружия + тот же мод.
 */
export function weaponAttack(
  item: Equipment,
  mods: AbilityScores,
  profBonus: number,
  proficient: boolean,
): WeaponAttack | undefined {
  const w = item.weapon;
  if (!w?.damage) return undefined;
  let ability: AbilityId = w.range === 'ranged' ? 'dex' : 'str';
  if (w.properties.includes('finesse')) ability = mods.dex > mods.str ? 'dex' : 'str';
  const mod = mods[ability];
  return {
    itemId: item.id,
    ability,
    toHit: mod + (proficient ? profBonus : 0),
    damageDice: w.damage.dice,
    damageBonus: mod,
    damageType: w.damage.type,
    proficient,
  };
}

/** Среднее значение кости хитов: к8 → 5. */
export function averageHitDie(hitDie: number): number {
  return hitDie / 2 + 1;
}
