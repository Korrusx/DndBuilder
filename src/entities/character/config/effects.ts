import type { Effect } from '../model/types';

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
