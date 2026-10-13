import type { AbilityId, Equipment } from '@/shared/content';

import type { AbilityScores, AcInput, Effect, HpLevel, WeaponAttack, WeaponAttackOptions } from './types';

// --- Хиты ---

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

/**
 * КЗ: без доспеха 10 + ЛОВ (или лучшая из формул «Защиты без доспехов»);
 * лёгкий — база + ЛОВ, средний — база + ЛОВ (не больше +2), тяжёлый — база; щит +2.
 */
export function armorClass({ armor, shield, mods, effects }: AcInput): number {
  let ac: number;
  if (armor) {
    let maxDex = armor.maxDex ?? Infinity;
    if (armor.category === 'medium') for (const e of effects) if (e.type === 'mediumArmorMaxDex') maxDex = Math.max(maxDex, e.value);
    const dex = armor.dexBonus ? Math.min(mods.dex, maxDex) : 0;
    ac = armor.base + dex;
    for (const e of effects) if (e.type === 'armoredAcBonus') ac += e.value;
  } else {
    ac = 10 + mods.dex;
    for (const e of effects) {
      if (e.type !== 'unarmoredDefense' || (shield && !e.shieldAllowed)) continue;
      ac = Math.max(ac, (e.base ?? 10) + e.abilities.reduce((s, id) => s + mods[id], 0));
    }
  }
  if (shield) ac += shield.base;
  for (const e of effects) if (e.type === 'acBonus') ac += e.value;
  return ac;
}

// --- Инициатива ---

export function initiative(dexMod: number, profBonus: number, effects: Effect[]): number {
  const addsPb = effects.some((e) => e.type === 'initiativeAddsProficiency');
  let bonus = 0;
  for (const e of effects) if (e.type === 'initiativeBonus') bonus += e.value;
  return dexMod + (addsPb ? profBonus : 0) + bonus;
}

// --- Атаки оружием ---

/**
 * Атака оружием: мод СИЛ для рукопашного, ЛОВ для дальнобойного,
 * лучший из СИЛ/ЛОВ для фехтовального. + БМ при владении. Урон: кость оружия + тот же мод.
 */
export function weaponAttack(
  item: Equipment,
  mods: AbilityScores,
  profBonus: number,
  proficient: boolean,
  opts: WeaponAttackOptions = {},
): WeaponAttack | undefined {
  const w = item.weapon;
  if (!w?.damage) return undefined;
  const ranged = w.range === 'ranged';
  let ability: AbilityId = ranged ? 'dex' : 'str';
  if (w.properties.includes('finesse')) ability = mods.dex > mods.str ? 'dex' : 'str';
  const mod = mods[ability];
  const magic = opts.magicBonus ?? 0;
  const minDie = !ranged ? opts.greatWeaponMinDie : undefined;
  const rage = opts.strengthDamageBonus ?? 0;
  const damageBonus = mod + magic + (ability === 'str' ? rage : 0);
  return {
    key: magic ? `${item.id}+${magic}` : item.id,
    itemId: item.id,
    ability,
    toHit: mod + (proficient ? profBonus : 0) + magic + (ranged ? (opts.rangedAttackBonus ?? 0) : 0),
    damageDice: w.damage.dice,
    damageBonus,
    damageMinDie: w.properties.includes('two-handed') ? minDie : undefined,
    twoHanded: w.twoHandedDamage ? { dice: w.twoHandedDamage.dice, minDie } : undefined,
    damageType: w.damage.type,
    proficient,
    magicBonus: magic,
    // Свойство «Лёгкое» (SRD 5.2): в дополнительную атаку модификатор не прибавляется, если он не отрицательный.
    ...(w.properties.includes('light')
      ? { offhandDamageBonus: damageBonus - mod + (opts.twoWeaponFighting ? mod : Math.min(0, mod)) }
      : {}),
    ...(rage && ability === 'dex' && w.properties.includes('finesse')
      ? { strengthAlt: { toHit: mods.str + (proficient ? profBonus : 0) + magic, damageBonus: mods.str + magic + rage } }
      : {}),
  };
}

/** Среднее значение кости хитов: к8 → 5. */
export function averageHitDie(hitDie: number): number {
  return hitDie / 2 + 1;
}
