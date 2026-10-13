import type { Character } from '@/entities/character';
import { computeSheet, irmaLevel1 } from '@/entities/character';
import { content } from '@/shared/content';

import {
  canMulticlassInto,
  finishLevelUp,
  leveledClassId,
  levelUpHpGain,
  levelUpIssues,
  levelUpPlan,
  multiclassRequirementText,
  startLevelUp,
} from '../levelup';

const blocking = (next: Character, prev: Character) => levelUpIssues(next, prev, content).filter((i) => i.blocking).map((i) => i.message);

describe('мультикласс при повышении уровня', () => {
  const irma = irmaLevel1(); // плут 1: СИЛ 8, ЛОВ 17, ТЕЛ 14, ИНТ 14, МДР 12, ХАР 10

  test('новый класс добавляется 1-м уровнем; повышенный класс определяется по разнице', () => {
    const next = startLevelUp(irma, 'wizard');
    expect(next.classes).toEqual([...irma.classes, { classId: 'wizard', level: 1 }]);
    expect(leveledClassId(next, irma)).toBe('wizard');
    expect(leveledClassId(startLevelUp(irma), irma)).toBe('rogue');
  });

  test('требования: 13+ в основной характеристике нового класса и текущих', () => {
    expect(canMulticlassInto(irma, content, 'wizard')).toBe(true); // ИНТ 14, ЛОВ 17
    expect(canMulticlassInto(irma, content, 'fighter')).toBe(true); // СИЛ или ЛОВ 13
    expect(canMulticlassInto(irma, content, 'barbarian')).toBe(false); // СИЛ 8
    expect(canMulticlassInto(irma, content, 'cleric')).toBe(false); // МДР 12
    expect(multiclassRequirementText('paladin', content)).toBe('СИЛ 13 и ХАР 13');
    expect(multiclassRequirementText('fighter', content)).toBe('СИЛ или ЛОВ 13');
  });

  test('плут → воин: стиль боя и приёмы оружия, хиты — среднее к10 + ТЕЛ', () => {
    const next = startLevelUp(irma, 'fighter');
    const plan = levelUpPlan(next, content, 'fighter');
    expect(plan).toMatchObject({ isNewClass: true, toLevel: 1, charLevel: 2, fightingStyles: 1, multiclassChoices: [] });
    expect(levelUpHpGain(next, irma, content)).toBe(6 + 2);
    expect(blocking(next, irma)).toContain('Выберите боевой стиль');
  });

  test('плут → волшебник: книга из 6 заклинаний и заклинания волшебника — напоминания', () => {
    const next = startLevelUp(irma, 'wizard');
    const soft = levelUpIssues(next, irma, content).filter((i) => !i.blocking).map((i) => i.message);
    expect(soft.some((m) => /книг.*6/.test(m))).toBe(true);
    expect(soft.some((m) => /заклинан/i.test(m))).toBe(true);
    const done = finishLevelUp(next, irma, content);
    expect(computeSheet(done, content).spellcasting).toMatchObject({ classId: 'wizard', slots: [2, 0, 0, 0, 0, 0, 0, 0, 0] });
  });

  test('воин → плут: навык на выбор, 2 компетентности, язык от «Воровского жаргона»', () => {
    const fighter: Character = { ...irmaLevel1(), classes: [{ classId: 'fighter', level: 1 }], choices: {}, expertise: [] };
    const next = startLevelUp(fighter, 'rogue');
    const plan = levelUpPlan(next, content, 'rogue');
    expect(plan.multiclassChoices).toEqual([expect.objectContaining({ key: 'mc.rogue.prof.0', choose: 1 })]);
    expect(plan.expertise).toBe(2);
    const issues = blocking(next, fighter);
    expect(issues).toContain('Выберите владения нового класса: 1');
    expect(issues.some((m) => /Воровской жаргон/.test(m))).toBe(true);
    // Выбранный навык становится владением.
    const withSkill = { ...next, choices: { ...next.choices, 'mc.rogue.prof.0': ['skill-acrobatics'] } };
    expect(computeSheet(withSkill, content).skills.find((s) => s.id === 'acrobatics')?.proficient).toBe(true);
  });

  test('новый жрец: «Божественный порядок» нужно выбрать', () => {
    const wise: Character = { ...irmaLevel1(), baseAbilities: { ...irmaLevel1().baseAbilities, wis: 13 } };
    const next = startLevelUp(wise, 'cleric');
    expect(levelUpPlan(next, content, 'cleric').featureOptions).toEqual(['cleric-divine-order']);
    expect(blocking(next, wise)).toContain('Не выбран вариант умения класса');
  });

  test('черта за уровень помечается общим уровнем: плут 4 при волшебнике 1 — 5-й уровень персонажа', () => {
    const c: Character = { ...irmaLevel1(), classes: [{ classId: 'rogue', level: 3 }, { classId: 'wizard', level: 1 }] };
    const next = startLevelUp(c, 'rogue');
    const plan = levelUpPlan(next, content, 'rogue');
    expect(plan).toMatchObject({ toLevel: 4, charLevel: 5, featSlot: 'asi' });
  });
});
