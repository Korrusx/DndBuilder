import type { Character } from '@/entities/character';
import { computeSheet, irmaLevel1, setClass } from '@/entities/character';
import { content } from '@/shared/content';

import {
  featAbilityRule,
  finishLevelUp,
  levelFeatOptions,
  levelUpHpGain,
  levelUpIssues,
  levelUpPlan,
  startLevelUp,
} from '../levelup';

const blocking = (next: Character, prev: Character) =>
  levelUpIssues(next, prev, content)
    .filter((i) => i.blocking)
    .map((i) => i.message);

/** Повысить уровень, применив выборы `choose`. */
function levelUp(c: Character, choose: (n: Character) => Character = (n) => n): Character {
  const next = choose(startLevelUp(c));
  expect(blocking(next, c)).toEqual([]);
  return finishLevelUp(next, c, content);
}

describe('повышение уровня: Ирма Вейл до 5-го', () => {
  test('по шагам с выборами — числа как в контрольном примере', () => {
    let irma = irmaLevel1();
    irma.state.currentHp = 10;

    // 2-й уровень: выборов нет, +7 хитов (среднее к8 = 5, ТЕЛ +2).
    irma = levelUp(irma);
    expect(computeSheet(irma, content).maxHp).toBe(17);
    expect(irma.state.currentHp).toBe(17);

    // 3-й: подкласс обязателен.
    const at3 = startLevelUp(irma);
    expect(levelUpPlan(at3, content).needsSubclass).toBe(true);
    expect(blocking(at3, irma)).toEqual(['Выберите подкласс']);
    irma = levelUp(irma, (n) => ({ ...n, classes: [{ ...n.classes[0], subclassId: 'thief' }] }));
    expect(levelUpPlan(startLevelUp(irma), content).featSlot).toBe('asi');

    // 4-й: «Увеличение характеристик» ЛОВ +1, ТЕЛ +1.
    const at4 = startLevelUp(irma);
    expect(levelFeatOptions(at4, content, 'asi')).toEqual(expect.arrayContaining(['ability-score-improvement', 'grappler', 'skilled']));
    expect(blocking(at4, irma)).toEqual(['Выберите увеличение характеристик или черту']);
    const badAsi = { ...at4, feats: [{ featId: 'ability-score-improvement', source: 'class' as const, level: 4, abilityIncreases: { dex: 1 } }] };
    expect(blocking(badAsi, irma)).toEqual(['Распределите +2 к характеристикам']);
    irma = levelUp(irma, (n) => ({
      ...n,
      feats: [{ featId: 'ability-score-improvement', source: 'class', level: 4, abilityIncreases: { dex: 1, con: 1 } }],
    }));

    // 5-й: без выборов.
    irma = levelUp(irma);
    const sheet = computeSheet(irma, content);
    expect(sheet.maxHp).toBe(38);
    expect(sheet.profBonus).toBe(3);
    expect(sheet.initiative).toBe(7);
    expect(sheet.abilities.dex.score).toBe(18);
    expect(sheet.classSpecific.rogue?.sneak_attack).toEqual({ dice_count: 3, dice_value: 6 });
  });

  test('6-й уровень плута: ещё две компетентности', () => {
    const rogue5 = { ...irmaLevel1(), classes: [{ classId: 'rogue', subclassId: 'thief', level: 5 }] };
    const at6 = startLevelUp(rogue5);
    expect(levelUpPlan(at6, content).expertise).toBe(2);
    expect(blocking(at6, rogue5)).toEqual(['Выберите компетентность: 2']);
    expect(blocking({ ...at6, expertise: [...at6.expertise, 'acrobatics', 'perception'] }, rogue5)).toEqual([]);
    // Только во владеемых навыках.
    expect(blocking({ ...at6, expertise: [...at6.expertise, 'acrobatics', 'arcana'] }, rogue5)).toHaveLength(1);
  });
});

describe('выборы других классов', () => {
  const at = (classId: string, level: number): Character => ({
    ...setClass(irmaLevel1(), classId),
    classes: [{ classId, level }],
  });

  test('паладин на 2-м: боевой стиль', () => {
    const prev = at('paladin', 1);
    const next = startLevelUp(prev);
    expect(blocking(next, prev)).toEqual(['Выберите боевой стиль']);
    const withStyle = { ...next, feats: [{ featId: 'defense', source: 'class' as const, level: 2 }] };
    expect(blocking(withStyle, prev)).toEqual([]);
  });

  test('варвар на 3-м: подкласс и навык «Первобытного знания»', () => {
    const prev = at('barbarian', 2);
    const next = startLevelUp(prev);
    const plan = levelUpPlan(next, content);
    expect(plan.skillChoices).toHaveLength(1);
    expect(plan.skillChoices[0].options).toContain('skill-survival');
    const done = {
      ...next,
      classes: [{ ...next.classes[0], subclassId: 'path-of-the-berserker' }],
      choices: { ...next.choices, [plan.skillChoices[0].key]: ['skill-survival'] },
    };
    expect(blocking(done, prev)).toEqual([]);
    expect(computeSheet(done, content).skills.find((s) => s.id === 'survival')?.proficient).toBe(true);
  });

  test('эпический дар: +1 к характеристике до 30', () => {
    expect(featAbilityRule('boon-of-fate')).toMatchObject({ mode: 'one', cap: 30 });
    const prev = { ...at('fighter', 18), baseAbilities: { str: 20, dex: 14, con: 14, int: 10, wis: 10, cha: 8 }, backgroundBonuses: {} };
    const next = startLevelUp(prev);
    expect(levelUpPlan(next, content).featSlot).toBe('epic-boon');
    const withBoon = {
      ...next,
      feats: [{ featId: 'boon-of-fate', source: 'class' as const, level: 19, abilityIncreases: { str: 1 }, abilityCap: 30 }],
    };
    expect(blocking(withBoon, prev)).toEqual([]);
    expect(computeSheet(withBoon, content).abilities.str.score).toBe(21);
  });

  test('подклассы Player\'s Handbook: по 4 на класс, умения подкласса появляются на своих уровнях', () => {
    for (const cls of content.classes) expect(cls.subclasses).toHaveLength(4);
    const prev = at('rogue', 2);
    const next = startLevelUp(prev);
    expect(levelUpPlan(next, content).needsSubclass).toBe(true);
    const done = { ...next, classes: [{ ...next.classes[0], subclassId: 'arcane-trickster' }] };
    expect(levelUpPlan(done, content).features).toEqual(
      expect.arrayContaining([
        { id: 'arcane-trickster-spellcasting', source: 'subclass' },
        { id: 'arcane-trickster-mage-hand-legerdemain', source: 'subclass' },
      ]),
    );
    const sheet = computeSheet(finishLevelUp(done, prev, content), content);
    const fromSubclass = sheet.features.filter((f) => f.source === 'subclass').map((f) => f.id);
    expect(fromSubclass).toEqual(['arcane-trickster-spellcasting', 'arcane-trickster-mage-hand-legerdemain']);
  });

  test('«Крепкий» на уровне добавляет хиты за все уровни', () => {
    const prev = at('fighter', 3);
    const next = {
      ...startLevelUp(prev),
      feats: [{ featId: 'tough', source: 'class' as const, level: 4 }],
    };
    // Среднее к10 = 6, ТЕЛ +2, «Крепкий» +2 × 4 уровня.
    expect(levelUpHpGain(next, prev, content)).toBe(6 + 2 + 8);
  });
});

describe('книга волшебника при повышении уровня', () => {
  test('на 2-м уровне нужно вписать в книгу ещё 2 заклинания (не блокирует)', () => {
    const level1 = content.spells.filter((s) => s.level === 1 && s.classes.includes('wizard')).map((s) => s.id);
    const prev: Character = { ...irmaLevel1(), classes: [{ classId: 'wizard', level: 1 }], choices: { 'class.wizard.spellbook': level1.slice(0, 6) } };
    const next = startLevelUp(prev);
    const issue = levelUpIssues(next, prev, content).find((i) => i.action === 'spells' && /книг/.test(i.message));
    expect(issue).toMatchObject({ blocking: false });
    const added = { ...next, choices: { 'class.wizard.spellbook': level1.slice(0, 8) } };
    expect(levelUpIssues(added, prev, content).some((i) => /книг/.test(i.message))).toBe(false);
  });
});
