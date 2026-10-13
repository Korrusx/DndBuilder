import type { Effect } from '../model/types';

/** Эффекты по id умения, особенности или черты (редакция 2024 и общие для обеих редакций). */
export const EFFECTS: Record<string, Effect[]> = {
  // Черта «Бдительность» (Alert): Initiative Proficiency.
  alert: [{ type: 'initiativeAddsProficiency' }],
  // Черта стиля боя «Оборона» (Defense): +1 к КЗ в лёгком, среднем или тяжёлом доспехе.
  defense: [{ type: 'armoredAcBonus', value: 1 }],
  // Черта стиля боя «Стрельба» (Archery): +2 к броскам атаки дальнобойным оружием.
  archery: [{ type: 'rangedAttackBonus', value: 2 }],
  // Черта стиля боя «Сражение большим оружием» (Great Weapon Fighting): урон рукопашным оружием,
  // которое держите двумя руками (свойство «двуручное» или «универсальное»), — 1 и 2 на кости считаются за 3.
  'great-weapon-fighting': [{ type: 'greatWeaponMinDie', value: 3 }],
  // Черта стиля боя «Сражение двумя оружиями» (Two-Weapon Fighting): к урону дополнительной атаки
  // от свойства «лёгкое» прибавляется модификатор характеристики.
  'two-weapon-fighting': [{ type: 'lightExtraAttackModifier' }],
  // Черта «Крепкий» (Tough, не SRD): +2 хита за каждый уровень.
  tough: [{ type: 'hpPerLevel', value: 2 }],
  // Дварф, «Дварфийская стойкость»: +1 хит за каждый уровень.
  'dwarven-toughness': [{ type: 'hpPerLevel', value: 1 }],
  // Кованый (не SRD), «Встроенная защита»: +1 к КЗ.
  'integrated-protection': [{ type: 'acBonus', value: 1 }],
  // Варвар, «Защита без доспехов»: 10 + ЛОВ + ТЕЛ, щит можно.
  'barbarian-unarmored-defense': [{ type: 'unarmoredDefense', abilities: ['dex', 'con'], shieldAllowed: true }],
  // Монах, «Защита без доспехов»: 10 + ЛОВ + МДР, без доспеха и щита.
  'monk-unarmored-defense': [{ type: 'unarmoredDefense', abilities: ['dex', 'wis'], shieldAllowed: false }],
  // Монах, «Движение без доспехов»: бонус скорости из таблицы класса.
  'monk-unarmored-movement': [
    { type: 'unarmoredSpeedFromClassTable', classId: 'monk', column: 'unarmored_movement_bonus' },
  ],
  // Чародей (Драконье чародейство), «Драконья устойчивость»: +3 хита на 3-м уровне и +1 за каждый
  // следующий уровень чародея (итого = уровню чародея); без доспеха КЗ 10 + ЛОВ + ХАР.
  'draconic-sorcery-draconic-resilience': [
    { type: 'hpPerClassLevel', classId: 'sorcerer', fromLevel: 3 },
    { type: 'unarmoredDefense', abilities: ['dex', 'cha'], shieldAllowed: true },
  ],
};

/**
 * Редакция 2014 (SRD 5.1, механика PHB 2014). Если id есть здесь, для персонажа 2014 берутся эти эффекты
 * вместо EFFECTS; остальные id (дварфийская стойкость, «Защита без доспехов» варвара и монаха) — общие.
 */
export const EFFECTS_2014: Record<string, Effect[]> = {
  // Черта «Бдительность» (PHB 2014): +5 к инициативе.
  alert: [{ type: 'initiativeBonus', value: 5 }],
  // Боевые стили (SRD 5.1) — варианты умения «Боевой стиль» воина, паладина и следопыта.
  // «Сражение большим оружием» 2014 — переброс 1 и 2 на костях урона; приложение его не считает.
  'fighter-fighting-style-archery': [{ type: 'rangedAttackBonus', value: 2 }],
  'ranger-fighting-style-archery': [{ type: 'rangedAttackBonus', value: 2 }],
  'fighter-fighting-style-defense': [{ type: 'armoredAcBonus', value: 1 }],
  'fighting-style-defense': [{ type: 'armoredAcBonus', value: 1 }],
  'ranger-fighting-style-defense': [{ type: 'armoredAcBonus', value: 1 }],
  'fighter-fighting-style-two-weapon-fighting': [{ type: 'lightExtraAttackModifier' }],
  'ranger-fighting-style-two-weapon-fighting': [{ type: 'lightExtraAttackModifier' }],
  // Монах, «Движение без доспехов» (SRD 5.1): бонус скорости из таблицы класса.
  'unarmored-movement-1': [{ type: 'unarmoredSpeedFromClassTable', classId: 'monk', column: 'unarmored_movement' }],
  // Чародей (Происхождение драконьей крови), «Драконья устойчивость» (SRD 5.1): +1 хит за каждый уровень чародея;
  // без доспеха КЗ 13 + ЛОВ.
  'draconic-resilience': [
    { type: 'hpPerClassLevel', classId: 'sorcerer', fromLevel: 1 },
    { type: 'unarmoredDefense', abilities: ['dex'], shieldAllowed: true, base: 13 },
  ],
};
