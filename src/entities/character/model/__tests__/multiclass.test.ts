import { content } from '@/shared/content';

import { irmaLevel1 } from '../../lib/samples';
import { classSpellLists, primaryCasterId, setClassSpellLists, spellLimits, weaponMasteryCount, weaponMasteryOptions } from '../build';
import { emptyGameState } from '../character';
import { adjustPactSlot, finishShortRest } from '../play';
import { longRest } from '../rest';
import { computeSheet } from '../sheet';
import type { ClassEntry } from '../types';

const slots = (...n: number[]) => [...n, ...Array(9 - n.length).fill(0)];
const as = (...classes: ClassEntry[]) => ({ ...irmaLevel1(), classes });

describe('мультикласс: Ирма, плут 3 / волшебник 2', () => {
  const irma = as({ classId: 'rogue', level: 3 }, { classId: 'wizard', level: 2 });
  const sheet = computeSheet(irma, content);

  test('бонус мастерства и рост заговоров — по общему уровню 5', () => {
    expect(sheet.level).toBe(5);
    expect(sheet.profBonus).toBe(3);
  });

  test('хиты: 1-й уровень плута — максимум к8, дальше средние; кости хитов по классам', () => {
    // 8 + 2 (ТЕЛ) за 1-й уровень; плут 2–3: (5 + 2) × 2; волшебник 1–2: (4 + 2) × 2.
    expect(sheet.maxHp).toBe(10 + 14 + 12);
    expect(sheet.hitDice).toEqual([
      { classId: 'rogue', die: 8, total: 3 },
      { classId: 'wizard', die: 6, total: 2 },
    ]);
  });

  test('спасброски — только от первого класса', () => {
    expect(sheet.abilities.dex.saveProficient).toBe(true);
    expect(sheet.abilities.wis.saveProficient).toBe(false); // волшебник даёт МДР только одноклассовому
  });

  test('умения обоих классов по их уровням', () => {
    const ids = sheet.features.map((f) => f.id);
    expect(ids).toContain('rogue-cunning-action');
    expect(ids).toContain('wizard-arcane-recovery');
    expect(ids).not.toContain('rogue-cunning-strike'); // это 5-й уровень плута
  });

  test('заклинатель один — ячейки по таблице волшебника 2-го уровня; лимиты как у волшебника 2', () => {
    expect(sheet.spellcasting).toMatchObject({ classId: 'wizard', ability: 'int', slots: slots(3), slotsFromPact: false });
    expect(spellLimits(irma, content)).toMatchObject({ classId: 'wizard', cantrips: 3, prepared: 5, maxSpellLevel: 1 });
    expect(spellLimits(irma, content, 'rogue')).toBeNull();
  });
});

describe('мультикласс: ячейки заклинаний', () => {
  const sheetOf = (...classes: ClassEntry[]) => computeSheet(as(...classes), content);

  test('несколько заклинателей — общая таблица: полные уровни + половина паладина (вверх)', () => {
    // Чародей 3 + паладин 2 → 3 + 1 = 4-й уровень таблицы: 4 / 3.
    expect(sheetOf({ classId: 'sorcerer', level: 3 }, { classId: 'paladin', level: 2 }).spellcasting?.slots).toEqual(slots(4, 3));
    // Следопыт 3 + паладин 3 → 2 + 2 = 4: 4 / 3.
    expect(sheetOf({ classId: 'ranger', level: 3 }, { classId: 'paladin', level: 3 }).spellcasting?.slots).toEqual(slots(4, 3));
    // Жрец 5 + волшебник 5 → 10: 4 / 3 / 3 / 3 / 2.
    expect(sheetOf({ classId: 'cleric', level: 5 }, { classId: 'wizard', level: 5 }).spellcasting?.slots).toEqual(slots(4, 3, 3, 3, 2));
  });

  test('у каждого заклинателя своя характеристика, СЛ и атака', () => {
    const s = sheetOf({ classId: 'cleric', level: 1 }, { classId: 'wizard', level: 1 });
    expect(s.spellcastingClasses.map((x) => [x.classId, x.ability])).toEqual([
      ['cleric', 'wis'],
      ['wizard', 'int'],
    ]);
    expect(s.spellcastingClasses[1].saveDC).toBe(8 + 2 + 2); // ИНТ 14, БМ 2
  });

  test('колдун + чародей: «Магия договора» отдельно', () => {
    const s = sheetOf({ classId: 'warlock', level: 3 }, { classId: 'sorcerer', level: 2 });
    expect(s.spellcasting?.slots).toEqual(slots(3)); // чародей 2
    expect(s.pactSlots).toEqual(slots(0, 2)); // колдун 3: две ячейки 2-го круга
    expect(s.spellcasting?.slotsFromPact).toBe(false);
  });

  test('колдун без других заклинателей: его ячейки — общие, как у одноклассового', () => {
    const s = sheetOf({ classId: 'warlock', level: 3 }, { classId: 'fighter', level: 2 });
    expect(s.spellcasting?.slots).toEqual(slots(0, 2));
    expect(s.pactSlots).toBeUndefined();
    expect(s.spellcasting?.slotsFromPact).toBe(true);
  });

  test('ячейки договора: трата, короткий и долгий отдых', () => {
    const pact = slots(0, 2);
    const spent = adjustPactSlot(emptyGameState(), 2, 1, pact);
    expect(spent.pactSlotsSpent?.[1]).toBe(1);
    expect(adjustPactSlot(spent, 2, 5, pact).pactSlotsSpent?.[1]).toBe(2); // не больше максимума
    const withRegular = { ...spent, slotsSpent: slots(1) };
    const rested = finishShortRest(withRegular, false);
    expect(rested.pactSlotsSpent).toBeUndefined();
    expect(rested.slotsSpent[0]).toBe(1); // общие ячейки короткий отдых не возвращает
    expect(longRest(spent, 10).pactSlotsSpent).toBeUndefined();
  });
});

describe('мультикласс: заклинания по классам', () => {
  test('основной заклинатель — первый класс с заклинаниями, даже если персонаж начинал воином', () => {
    const c = as({ classId: 'fighter', level: 1 }, { classId: 'wizard', level: 1 });
    expect(primaryCasterId(c, content)).toBe('wizard');
  });

  test('у второго заклинателя свои списки; первого они не трогают', () => {
    const c = { ...as({ classId: 'cleric', level: 1 }, { classId: 'wizard', level: 1 }), cantrips: ['guidance'] };
    const next = setClassSpellLists(c, content, 'wizard', { cantrips: ['fire-bolt'] });
    expect(classSpellLists(next, content, 'wizard').cantrips).toEqual(['fire-bolt']);
    expect(classSpellLists(next, content, 'cleric').cantrips).toEqual(['guidance']);
    expect(next.cantrips).toEqual(['guidance']);
  });
});

describe('мультикласс: приёмы оружия', () => {
  test('воин 3 + варвар 2 — наибольшее число (3), не сумма; дальнобойное оружие доступно', () => {
    const c = as({ classId: 'fighter', level: 3 }, { classId: 'barbarian', level: 2 });
    expect(weaponMasteryCount(c, content)).toBe(3);
    expect(weaponMasteryOptions(c, content)).toContain('longbow');
  });

  test('только варвар — только рукопашное', () => {
    expect(weaponMasteryOptions(as({ classId: 'barbarian', level: 1 }), content)).not.toContain('longbow');
  });
});
