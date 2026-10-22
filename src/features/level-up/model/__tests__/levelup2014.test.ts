import type { Character } from '@/entities/character';
import { irma2014Level1, newDraftCharacter } from '@/entities/character';
import { contentFor } from '@/shared/content';

import { levelFeatOptions, levelUpIssues, levelUpPlan, startLevelUp } from '../levelup';

const content = contentFor('2014');

const at = (c: Character, level: number): Character => ({ ...c, classes: [{ ...c.classes[0], level }] });
const make = (classId: string, level: number, subclassId?: string): Character => ({
  ...newDraftCharacter('t', 'now', '2014'),
  speciesId: 'human',
  backgroundId: 'acolyte',
  baseAbilities: { str: 14, dex: 14, con: 14, int: 14, wis: 14, cha: 14 },
  classes: [{ classId, level, ...(subclassId ? { subclassId } : {}) }],
  status: { kind: 'ready' },
});
const plan = (c: Character) => levelUpPlan(startLevelUp(c), content);

describe('повышение уровня 2014', () => {
  test('Ирма: архетип на 3-м, «Увеличение характеристик» на 4-м, компетентность на 6-м', () => {
    const irma = irma2014Level1();
    expect(plan(at(irma, 2)).needsSubclass).toBe(true);
    expect(plan(at(irma, 3))).toMatchObject({ needsSubclass: false, featSlot: 'asi' });
    expect(plan(at(irma, 5)).expertise).toBe(2);
    expect(plan(at(irma, 1)).expertise).toBe(0);
  });

  test('«Увеличение характеристик» есть среди черт уровня', () => {
    const next = startLevelUp(at(irma2014Level1(), 3));
    expect(levelFeatOptions(next, content, 'asi')).toContain('ability-score-improvement');
    expect(levelUpIssues(next, at(irma2014Level1(), 3), content).some((i) => i.blocking)).toBe(true);
  });

  test('подкласс: волшебник — на 2-м, воин — на 3-м', () => {
    expect(plan(make('wizard', 1)).needsSubclass).toBe(true);
    expect(plan(make('fighter', 1)).needsSubclass).toBe(false);
    expect(plan(make('fighter', 2)).needsSubclass).toBe(true);
  });

  test('боевой стиль паладина на 2-м уровне', () => {
    expect(plan(make('paladin', 1)).optionChoices).toEqual([
      expect.objectContaining({ featureId: 'paladin-fighting-style', total: 1 }),
    ]);
  });

  test('воззвания колдуна: 2 на 2-м уровне, 3 на 5-м; договор на 3-м', () => {
    expect(plan(make('warlock', 1, 'fiend')).optionChoices).toEqual([
      expect.objectContaining({ featureId: 'eldritch-invocations', total: 2 }),
    ]);
    expect(plan(make('warlock', 2, 'fiend')).optionChoices.map((o) => o.featureId)).toEqual(['pact-boon']);
    // SRD 5.1: 3 воззвания с 5-го уровня (в данных API ошибочно с 4-го — исправлено в сборке).
    expect(plan(make('warlock', 3, 'fiend')).optionChoices).toEqual([]);
    expect(plan(make('warlock', 4, 'fiend')).optionChoices).toEqual([
      expect.objectContaining({ featureId: 'eldritch-invocations', total: 3 }),
    ]);
    expect(plan(make('warlock', 6, 'fiend')).optionChoices).toEqual([
      expect.objectContaining({ featureId: 'eldritch-invocations', total: 4 }),
    ]);
  });

  test('без выбора варианта повысить нельзя', () => {
    const prev = make('paladin', 1);
    const next = startLevelUp(prev);
    expect(
      levelUpIssues(next, prev, content)
        .filter((i) => i.blocking)
        .map((i) => i.message),
    ).toContain('Не выбран вариант умения класса');
    const chosen = { ...next, choices: { 'feature.paladin-fighting-style': ['fighting-style-defense'] } };
    expect(
      levelUpIssues(chosen, prev, content)
        .filter((i) => i.blocking)
        .map((i) => i.message),
    ).toEqual([]);
  });

  test('коллегия знаний на 3-м уровне: три навыка на выбор', () => {
    const next = startLevelUp(make('bard', 2));
    const withLore = { ...next, classes: [{ ...next.classes[0], subclassId: 'lore' }] };
    expect(levelUpPlan(withLore, content).skillChoices).toEqual([
      expect.objectContaining({ featureId: 'bonus-proficiencies', choose: 3 }),
    ]);
  });
});
