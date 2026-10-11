import { content } from '@/content';
import { newDraftCharacter, type Character } from '../character';
import { CHOICE_KEYS } from '../choices';
import {
  draftIssues,
  equipmentPicks,
  equipmentChoice,
  expertiseCount,
  finishCharacter,
  firstIncompleteStep,
  magicInitiateSlots,
  proficiencySlots,
  setBackground,
  setClass,
  setSpecies,
  spellLimits,
  startingKit,
  weaponMasteryCount,
  weaponMasteryOptions,
} from '../creation';
import { computeSheet } from '../sheet';

const blank = () => newDraftCharacter('t', '2026-01-01T00:00:00.000Z');
const steps = (c: Character) => draftIssues(c, content).filter((i) => i.blocking).map((i) => i.step);

/** Ирма, собранная через мастер. */
function irmaViaWizard(): Character {
  let c = blank();
  c = setClass(c, 'rogue');
  c = setBackground(c, 'criminal');
  c = setSpecies(c, 'halfling', content);
  return {
    ...c,
    name: 'Ирма Вейл',
    abilityMethod: 'standard',
    baseAbilities: { str: 8, dex: 15, con: 14, int: 13, wis: 12, cha: 10 },
    backgroundBonuses: { dex: 2, int: 1 },
    choices: {
      ...c.choices,
      [CHOICE_KEYS.classProf('rogue', 0)]: ['skill-acrobatics', 'skill-investigation', 'skill-perception', 'skill-deception'],
      [CHOICE_KEYS.equipment('class')]: ['0'],
      [CHOICE_KEYS.equipment('background')]: ['0'],
    },
    expertise: ['stealth', 'sleight-of-hand'],
    weaponMasteries: ['shortsword', 'dagger'],
    languages: ['common', 'halfling', 'elvish'],
  };
}

describe('мастер создания', () => {
  test('пустой черновик: не хватает всего, начинать с шага 1', () => {
    const c = blank();
    expect(new Set(steps(c))).toEqual(new Set([1, 2, 3, 4, 6]));
    expect(firstIncompleteStep(c, content)).toBe(1);
  });

  test('Ирма через мастер: всё заполнено, числа как у контрольного примера', () => {
    const c = irmaViaWizard();
    expect(draftIssues(c, content)).toEqual([]);
    expect(firstIncompleteStep(c, content)).toBe(6);
    const done = finishCharacter(c, content);
    expect(done.status).toEqual({ kind: 'ready' });
    expect(done.state.currentHp).toBe(10);
    const sheet = computeSheet({ ...done, ...startingKit(done, content), equipment: startingKit(done, content).items }, content);
    expect(sheet.armorClass).toBe(14);
    expect(sheet.skills.find((s) => s.id === 'stealth')?.bonus).toBe(7);
    expect(sheet.skills.find((s) => s.id === 'acrobatics')?.bonus).toBe(5);
  });

  test('выбор навыков плута и компетентность', () => {
    const c = irmaViaWizard();
    const slots = proficiencySlots(c, content);
    expect(slots).toHaveLength(1);
    expect(slots[0]).toMatchObject({ source: 'class', choose: 4 });
    expect(expertiseCount(c, content)).toBe(2);
    expect(steps({ ...c, expertise: ['stealth'] })).toEqual([4]);
    // Компетентность только во владеемых навыках.
    expect(steps({ ...c, expertise: ['stealth', 'athletics'] })).toEqual([4]);
  });

  test('приёмы оружия', () => {
    const c = irmaViaWizard();
    expect(weaponMasteryCount(c, content)).toBe(2);
    const options = weaponMasteryOptions(c, content);
    expect(options).toEqual(expect.arrayContaining(['dagger', 'shortsword', 'rapier', 'shortbow']));
    expect(options).not.toContain('greataxe');
    expect(weaponMasteryCount(setClass(blank(), 'fighter'), content)).toBe(3);
    expect(weaponMasteryCount(setClass(blank(), 'wizard'), content)).toBe(0);
    const barbarian = { ...setClass(blank(), 'barbarian'), backgroundId: 'soldier' };
    expect(weaponMasteryOptions(barbarian, content)).not.toContain('longbow');
  });

  test('стартовое снаряжение: наборы складываются, доспех надет', () => {
    const kit = startingKit(irmaViaWizard(), content);
    expect(kit.coins).toEqual({ gp: 24 });
    expect(kit.items.find((i) => i.itemId === 'dagger')?.quantity).toBe(4);
    expect(kit.items.find((i) => i.itemId === 'leather-armor')?.equipped).toBe(true);
    const gold = startingKit({ ...irmaViaWizard(), choices: { 'equip.class': ['1'], 'equip.background': ['1'] } }, content);
    expect(gold).toEqual({ items: [], coins: { gp: 150 } });
  });

  test('предмет на выбор внутри набора (священный символ жреца)', () => {
    const c = { ...setClass(blank(), 'cleric'), choices: { 'equip.class': ['0'] } };
    const option = equipmentChoice(c, content, 'class')?.options?.[0];
    const picks = equipmentPicks(option, content);
    expect(picks).toHaveLength(1);
    expect(picks[0].options.length).toBeGreaterThan(0);
    expect(draftIssues(c, content).some((i) => i.message.includes('Не выбран предмет'))).toBe(true);
    const symbol = picks[0].options[0];
    const kit = startingKit({ ...c, choices: { ...c.choices, [`equip.class.pick.${picks[0].index}`]: [symbol] } }, content);
    expect(kit.items.map((i) => i.itemId)).toContain(symbol);
    expect(kit.items.filter((i) => i.equipped).map((i) => i.itemId).sort()).toEqual(['chain-shirt', 'shield']);
  });

  test('жрец-человек: «Божественный порядок», «Универсальность», «Посвящённый в магию»', () => {
    let c = setClass(blank(), 'cleric');
    c = setBackground(c, 'acolyte');
    c = setSpecies(c, 'human', content);
    expect(spellLimits(c, content)).toEqual({ classId: 'cleric', cantrips: 3, prepared: 4, maxSpellLevel: 1 });

    const thaum = { ...c, choices: { ...c.choices, 'feature.cleric-divine-order': ['thaumaturge'] } };
    expect(spellLimits(thaum, content)?.cantrips).toBe(4);

    const protector = { ...c, choices: { ...c.choices, 'feature.cleric-divine-order': ['protector'] } };
    const before = proficiencySlots(c, content).length;
    expect(steps(c)).toContain(4);
    const withSkilled = { ...protector, choices: { ...protector.choices, 'versatile.feat': ['skilled'] } };
    expect(proficiencySlots(withSkilled, content)).toHaveLength(before + 1);

    // У Прислужника список «Посвящённого в магию» задан — жрец.
    expect(magicInitiateSlots(c, content)).toEqual([{ slot: 'bgfeat', fixedList: 'cleric' }]);
    const twoInitiates = { ...c, choices: { ...c.choices, 'versatile.feat': ['magic-initiate'] } };
    expect(magicInitiateSlots(twoInitiates, content)).toEqual([
      { slot: 'bgfeat', fixedList: 'cleric' },
      { slot: 'versatile', fixedList: undefined },
    ]);
  });

  test('владения «Защитника» попадают в лист', () => {
    const c = { ...irmaViaWizard(), classes: [{ classId: 'cleric', level: 1 }], choices: { 'feature.cleric-divine-order': ['protector'] } };
    expect(computeSheet(c, content).proficiencies).toEqual(expect.arrayContaining(['heavy-armor', 'martial-weapons']));
  });

  test('смена класса сбрасывает выборы класса, но не предыстории', () => {
    const c = setClass(irmaViaWizard(), 'fighter');
    expect(c.choices[CHOICE_KEYS.classProf('rogue', 0)]).toBeUndefined();
    expect(c.choices[CHOICE_KEYS.equipment('class')]).toBeUndefined();
    expect(c.choices[CHOICE_KEYS.equipment('background')]).toEqual(['0']);
    expect(c.expertise).toEqual([]);
    expect(c.weaponMasteries).toEqual([]);
  });

  test('характеристики: покупка очков и броски', () => {
    const c = irmaViaWizard();
    expect(steps({ ...c, abilityMethod: 'pointBuy', baseAbilities: { str: 15, dex: 15, con: 15, int: 15, wis: 8, cha: 8 } })).toEqual([3]);
    expect(steps({ ...c, abilityMethod: 'pointBuy', baseAbilities: { str: 8, dex: 15, con: 15, int: 13, wis: 10, cha: 8 } })).toEqual([]);
    const rolled = { ...c, abilityMethod: 'roll' as const, abilityRolls: [16, 12, 11, 9, 14, 7] };
    expect(steps({ ...rolled, baseAbilities: { str: 7, dex: 16, con: 14, int: 12, wis: 11, cha: 9 } })).toEqual([]);
    expect(steps({ ...rolled, baseAbilities: { str: 18, dex: 16, con: 14, int: 12, wis: 11, cha: 9 } })).toEqual([3]);
    expect(steps({ ...c, backgroundBonuses: { str: 2, dex: 1 } })).toEqual([3]);
  });

  test('предыстории не из SRD: механика из data-pipeline/extra', () => {
    expect(content.backgrounds).toHaveLength(16);
    // Ремесленник: инструмент на выбор + три инструмента от черты «Ремесленник».
    const artisan = setBackground(setClass(blank(), 'fighter'), 'artisan');
    const slots = proficiencySlots(artisan, content).filter((sl) => sl.source !== 'class');
    expect(slots.map((sl) => [sl.source, sl.choose])).toEqual([
      ['background', 1],
      ['feat', 3],
    ]);
    // Проводник: «Посвящённый в магию» со списком друида.
    expect(magicInitiateSlots(setBackground(blank(), 'guide'), content)).toEqual([{ slot: 'bgfeat', fixedList: 'druid' }]);
    // Фермер: черта «Крепкий» — +2 хита за уровень.
    const irma = irmaViaWizard();
    const farmer = { ...irma, backgroundId: 'farmer' };
    expect(computeSheet(farmer, content).maxHp).toBe(computeSheet(irma, content).maxHp + 2);
    // Стражник: снаряжение с игровым набором на выбор.
    const guard = { ...setBackground(blank(), 'guard'), choices: { 'equip.background': ['0'] } };
    const picks = equipmentPicks(equipmentChoice(guard, content, 'background')?.options?.[0], content);
    expect(picks[0].options).toContain('dice');
  });

  test('лимиты на текущем уровне: заклинания и приёмы оружия', () => {
    const wizard = (level: number) => ({ ...setClass(blank(), 'wizard'), classes: [{ classId: 'wizard', level }] });
    expect(spellLimits(wizard(1), content)).toMatchObject({ cantrips: 3, prepared: 4, maxSpellLevel: 1 });
    expect(spellLimits(wizard(3), content)).toMatchObject({ cantrips: 3, prepared: 6, maxSpellLevel: 2 });
    expect(spellLimits(wizard(5), content)).toMatchObject({ cantrips: 4, prepared: 9, maxSpellLevel: 3 });
    // У колдуна все ячейки одного круга: на 3-м уровне — 2-го.
    const warlock = { ...setClass(blank(), 'warlock'), classes: [{ classId: 'warlock', level: 3 }] };
    expect(spellLimits(warlock, content)?.maxSpellLevel).toBe(2);
    const fighter = (level: number) => ({ ...setClass(blank(), 'fighter'), classes: [{ classId: 'fighter', level }] });
    expect(weaponMasteryCount(fighter(1), content)).toBe(3);
    expect(weaponMasteryCount(fighter(4), content)).toBe(4);
    expect(weaponMasteryCount({ ...irmaViaWizard(), classes: [{ classId: 'rogue', level: 5 }] }, content)).toBe(2);
  });
});
