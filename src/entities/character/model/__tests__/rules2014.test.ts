import { contentFor, indexOf } from '@/shared/content';

import { knownLanguages, spellLimits } from '../build';
import { characterResources } from '../resources';
import { emptyGameState, newDraftCharacter } from '../character';
import { exhaustionEffects2014, exhaustionPenalty, maxHpWithExhaustion, speedWithExhaustion } from '../play';
import { longRest } from '../rest';
import { computeSheet, finalAbilityScores } from '../sheet';
import { characterSpellSlots, spellDamage } from '../spells';
import type { Character, ClassEntry } from '../types';

const content = contentFor('2014');
const idx = indexOf(content);

/** Персонаж 2014 с предысторией «Прислужник» (единственная в SRD 5.1). */
function make(patch: Partial<Character>): Character {
  return {
    ...newDraftCharacter('t', '2026-01-01T00:00:00.000Z', '2014'),
    speciesId: 'human',
    backgroundId: 'acolyte',
    baseAbilities: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    status: { kind: 'ready' },
    ...patch,
  };
}

describe('2014: прибавки расы', () => {
  test('человек: +1 ко всем', () => {
    expect(finalAbilityScores(make({ classes: [{ classId: 'fighter', level: 1 }] }), content)).toEqual({
      str: 11,
      dex: 11,
      con: 11,
      int: 11,
      wis: 11,
      cha: 11,
    });
  });

  test('полуэльф: ХАР +2 и +1 к двум выбранным; ХАР выбрать нельзя, третья не считается', () => {
    const c = make({
      speciesId: 'half-elf',
      classes: [{ classId: 'bard', level: 1 }],
      choices: { 'trait.abilityBonus': ['cha', 'str', 'dex', 'con'] },
    });
    expect(finalAbilityScores(c, content)).toMatchObject({ cha: 12, str: 11, dex: 11, con: 10 });
  });

  test('бонусы предыстории 2024 в 2014 не действуют', () => {
    const c = make({
      speciesId: 'dwarf',
      subspeciesId: 'hill-dwarf',
      backgroundBonuses: { str: 2 },
      classes: [{ classId: 'fighter', level: 1 }],
    });
    expect(finalAbilityScores(c, content)).toMatchObject({ str: 10, con: 12, wis: 11 });
  });
});

describe('2014: особенности расы', () => {
  test('эльф: «Острые чувства» — Восприятие; высший эльф владеет длинным мечом', () => {
    const sheet = computeSheet(
      make({
        speciesId: 'elf',
        subspeciesId: 'high-elf',
        classes: [{ classId: 'wizard', level: 1 }],
        equipment: [{ itemId: 'longsword', quantity: 1 }],
      }),
      content,
    );
    expect(sheet.skills.find((s) => s.id === 'perception')?.proficient).toBe(true);
    expect(sheet.attacks.find((a) => a.itemId === 'longsword')?.proficient).toBe(true);
    expect(sheet.abilities.int.score).toBe(11);
  });

  test('холмовой дварф: +1 хит за уровень', () => {
    const sheet = computeSheet(
      make({ speciesId: 'dwarf', subspeciesId: 'hill-dwarf', classes: [{ classId: 'fighter', level: 1 }] }),
      content,
    );
    // к10 + ТЕЛ +1 (12) + 1
    expect(sheet.maxHp).toBe(12);
  });

  test('драконорождённый: выбранное наследие — особенностью расы', () => {
    const sheet = computeSheet(
      make({
        speciesId: 'dragonborn',
        classes: [{ classId: 'fighter', level: 1 }],
        choices: { 'trait.draconic-ancestry.option': ['draconic-ancestry-red'] },
      }),
      content,
    );
    expect(sheet.features).toContainEqual({ id: 'draconic-ancestry-red', source: 'species' });
    expect(idx.traits.get('draconic-ancestry-red')?.damageType).toBe('fire');
  });

  test('языки расы и выбранные', () => {
    expect(knownLanguages(make({ speciesId: 'dwarf', languages: ['elvish'] }), content)).toEqual([
      'common',
      'dwarvish',
      'elvish',
    ]);
  });
});

describe('2014: умения классов', () => {
  test('боевой стиль «Стрельба» — вариант умения: +2 к дальнобойным атакам', () => {
    const c = make({
      classes: [{ classId: 'fighter', level: 1 }],
      choices: { 'feature.fighter-fighting-style': ['fighter-fighting-style-archery'] },
      equipment: [{ itemId: 'longbow', quantity: 1 }],
    });
    const sheet = computeSheet(c, content);
    expect(sheet.features).toContainEqual({ id: 'fighter-fighting-style-archery', source: 'class' });
    // ЛОВ 11 (+0) + БМ 2 + 2
    expect(sheet.attacks.find((a) => a.itemId === 'longbow')?.toHit).toBe(4);
  });

  test('«Драконья устойчивость»: +1 хит за уровень чародея, без доспеха КЗ 13 + ЛОВ', () => {
    const c = make({
      classes: [{ classId: 'sorcerer', subclassId: 'draconic', level: 1 }],
      baseAbilities: { str: 8, dex: 14, con: 14, int: 10, wis: 10, cha: 15 },
    });
    const sheet = computeSheet(c, content);
    expect(sheet.maxHp).toBe(6 + 2 + 1);
    expect(sheet.armorClass).toBe(13 + 2);
  });

  test('«Движение без доспехов» монаха на 2-м уровне: +10 фт', () => {
    expect(computeSheet(make({ classes: [{ classId: 'monk', level: 2 }] }), content).speed).toBe(40);
  });

  test('заклинания домена Жизни по уровню жреца', () => {
    const sheet = computeSheet(make({ classes: [{ classId: 'cleric', subclassId: 'life', level: 3 }] }), content);
    expect(sheet.subclassSpells).toEqual(
      expect.arrayContaining(['bless', 'cure-wounds', 'lesser-restoration', 'spiritual-weapon']),
    );
    expect(sheet.subclassSpells).not.toContain('beacon-of-hope');
  });
});

describe('2014: заклинания', () => {
  const caster = (classId: string, level: number, scores: Partial<Character['baseAbilities']>) =>
    make({
      speciesId: 'human',
      classes: [{ classId, level }],
      baseAbilities: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10, ...scores },
    });

  test('волшебник готовит ИНТ + уровень', () => {
    // ИНТ 15 + 1 (человек) = 16 → +3
    expect(spellLimits(caster('wizard', 1, { int: 15 }), content)).toEqual({
      classId: 'wizard',
      cantrips: 3,
      prepared: 4,
      maxSpellLevel: 1,
    });
  });

  test('паладин готовит ХАР + половина уровня, с 2-го уровня', () => {
    expect(spellLimits(caster('paladin', 1, { cha: 15 }), content)).toBeNull();
    expect(spellLimits(caster('paladin', 3, { cha: 15 }), content)?.prepared).toBe(3 + 1);
  });

  test('не меньше одного подготовленного', () => {
    expect(spellLimits(caster('cleric', 1, { wis: 5 }), content)?.prepared).toBe(1);
  });

  test('бард знает заклинания по таблице', () => {
    expect(spellLimits(caster('bard', 1, { cha: 15 }), content)).toMatchObject({ cantrips: 2, prepared: 4 });
    expect(spellLimits(caster('bard', 5, { cha: 15 }), content)).toMatchObject({ cantrips: 3, prepared: 8 });
  });

  test('ячейки мультикласса: половина уровня паладина вниз (2024 — вверх)', () => {
    const entries: ClassEntry[] = [
      { classId: 'paladin', level: 3 },
      { classId: 'wizard', level: 2 },
    ];
    // 2014: 1 + 2 = 3-й уровень заклинателя
    expect(characterSpellSlots(entries, idx.classes, '2014').slice(0, 2)).toEqual([4, 2]);
    // 2024 (по той же таблице): 2 + 2 = 4
    expect(characterSpellSlots(entries, idx.classes, '2024').slice(0, 2)).toEqual([4, 3]);
  });

  test('«Мистический заряд»: лучи по уровню персонажа', () => {
    expect(spellDamage(idx.spells.get('eldritch-blast')!, 5)).toMatchObject({ dice: '1d10', beams: 2 });
    expect(spellDamage(idx.spells.get('fire-bolt')!, 11)).toMatchObject({ dice: '3d10' });
    expect(spellDamage(idx.spells.get('cure-wounds')!, 1, 2)).toMatchObject({
      dice: '2d8',
      kind: 'heal',
      addModifier: true,
    });
  });
});

describe('2014: отдых и истощение', () => {
  test('долгий отдых возвращает половину костей хитов (2024 — все)', () => {
    const state = { ...emptyGameState(), hitDiceSpent: { rogue: 5 } };
    const dice = [{ classId: 'rogue', die: 8, total: 5 }];
    expect(longRest(state, 38, '2014', dice).hitDiceSpent).toEqual({ rogue: 3 });
    expect(longRest(state, 38, '2024', dice).hitDiceSpent).toEqual({});
  });

  test('сначала крупные кости; на 1-м уровне — одна кость', () => {
    const dice = [
      { classId: 'wizard', die: 6, total: 3 },
      { classId: 'fighter', die: 10, total: 2 },
    ];
    expect(
      longRest({ ...emptyGameState(), hitDiceSpent: { fighter: 2, wizard: 3 } }, 30, '2014', dice).hitDiceSpent,
    ).toEqual({ wizard: 3 });
    expect(
      longRest({ ...emptyGameState(), hitDiceSpent: { rogue: 1 } }, 10, '2014', [
        { classId: 'rogue', die: 8, total: 1 },
      ]).hitDiceSpent,
    ).toEqual({});
  });

  test('истощение 2014: помехи вместо −2, скорость и хиты вдвое', () => {
    expect(exhaustionPenalty(3, '2014')).toBe(0);
    expect(exhaustionPenalty(3)).toBe(-6);
    expect(speedWithExhaustion(30, 1, '2014')).toBe(30);
    expect(speedWithExhaustion(30, 2, '2014')).toBe(15);
    expect(speedWithExhaustion(30, 5, '2014')).toBe(0);
    expect(maxHpWithExhaustion(38, 3, '2014')).toBe(38);
    expect(maxHpWithExhaustion(38, 4, '2014')).toBe(19);
    expect(maxHpWithExhaustion(38, 4)).toBe(38);
    expect(exhaustionEffects2014(1)).toEqual({ checkDisadvantage: true, attackSaveDisadvantage: false, dead: false });
    expect(exhaustionEffects2014(6)).toEqual({ checkDisadvantage: true, attackSaveDisadvantage: true, dead: true });
  });
});

describe('2014: ресурсы умений', () => {
  const res = (classId: string, level: number, scores: Partial<Character['baseAbilities']> = {}) =>
    characterResources(
      make({
        classes: [{ classId, level }],
        baseAbilities: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10, ...scores },
      }),
      content,
    ).map((r) => ({ id: r.id, max: r.max, recovery: r.recovery, ...(r.die ? { die: r.die } : {}) }));

  test('ярость — только долгим отдыхом', () => {
    expect(res('barbarian', 1)).toEqual([{ id: 'rage', max: 2, recovery: 'long' }]);
  });

  test('ки монаха и второе дыхание воина — коротким отдыхом', () => {
    expect(res('monk', 2)).toEqual([{ id: 'ki', max: 2, recovery: 'short' }]);
    expect(res('fighter', 2)).toEqual([
      { id: 'second-wind', max: 1, recovery: 'short' },
      { id: 'action-surge', max: 1, recovery: 'short' },
    ]);
  });

  test('божественное чувство: 1 + ХАР; наложение рук: 5 × уровень', () => {
    // ХАР 15 + 1 (человек) = 16 → +3
    expect(res('paladin', 1, { cha: 15 })).toEqual([
      { id: 'divine-sense', max: 4, recovery: 'long' },
      { id: 'lay-on-hands', max: 5, recovery: 'long' },
    ]);
  });

  test('бардовское вдохновение: к6, с 5-го уровня — к8 и короткий отдых', () => {
    expect(res('bard', 1, { cha: 15 })).toEqual([{ id: 'bardic-inspiration', max: 3, recovery: 'long', die: 6 }]);
    expect(res('bard', 5, { cha: 15 })).toEqual([{ id: 'bardic-inspiration', max: 3, recovery: 'short', die: 8 }]);
  });
});

describe('2014: истощение в листе', () => {
  test('с 4-го уровня максимум хитов вдвое меньше', () => {
    const c = make({ classes: [{ classId: 'fighter', level: 1 }] });
    // к10 + ТЕЛ 11 (+0)
    expect(computeSheet(c, content).maxHp).toBe(10);
    expect(computeSheet({ ...c, state: { ...c.state, exhaustion: 4 } }, content).maxHp).toBe(5);
  });
});
