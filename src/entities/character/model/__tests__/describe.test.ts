import { contentFor, indexOf } from '@/shared/content';

import {
  backgroundFits,
  backgroundsForClass,
  describeBackground,
  describeClass,
  describeSpecies,
  describeSubclass,
} from '../describe';

const content = contentFor('2024');
const content2014 = contentFor('2014');

describe('describeClass', () => {
  test('варвар 2024: к12, умения 1-го уровня, «что дальше», навыки 2 из 6', () => {
    const barbarian = describeClass('barbarian', content)!;
    expect(barbarian.hitDie).toBe(12);
    expect(barbarian.firstLevel.map((f) => f.id)).toEqual([
      'barbarian-rage',
      'barbarian-unarmored-defense',
      'barbarian-weapon-mastery',
    ]);
    expect(barbarian.next.map((row) => row.level)).toEqual([2, 3, 5]);
    expect(barbarian.next.find((row) => row.level === 3)?.subclass).toBe(true);
    expect(barbarian.next.find((row) => row.level === 5)?.features).toContain('Дополнительная атака');
    expect(barbarian.skills).toMatchObject({ choose: 2 });
    expect(barbarian.skills?.options).toHaveLength(6);
    expect(barbarian.savingThrows).toEqual(['str', 'con']);
    expect(barbarian.armor).toEqual(expect.arrayContaining(['light-armor', 'medium-armor', 'shields']));
    expect(barbarian.role).not.toBe('');
    expect(barbarian.pitch).not.toBe('');
    expect(barbarian.difficulty).toBe(1);
  });

  test('плут 2024: 4 навыка, Скрытая атака и Компетентность на 1-м уровне', () => {
    const rogue = describeClass('rogue', content)!;
    expect(rogue.skills?.choose).toBe(4);
    expect(rogue.firstLevel.map((f) => f.id)).toEqual(
      expect.arrayContaining(['rogue-sneak-attack', 'rogue-expertise']),
    );
  });

  test('мультикласс: сокращённые владения, без спасбросков', () => {
    const fighter = describeClass('fighter', content, { multiclass: true })!;
    expect(fighter.savingThrows).toEqual([]);
    expect(fighter.armor).not.toContain('heavy-armor');
    expect(describeClass('rogue', content, { multiclass: true })?.skills?.choose).toBe(1);
  });

  test('2014: жрец с доменом 1-го уровня — описание подкласса', () => {
    const cleric = describeClass('cleric', content2014, { subclassId: 'life' })!;
    expect(cleric.subclass?.id).toBe('life');
    expect(cleric.subclass?.features.length).toBeGreaterThan(0);
  });

  test('нет summary — первое предложение описания', () => {
    const toughness = describeSpecies('dwarf', content)!.traits.find((t) => t.id === 'dwarven-toughness')!;
    expect(indexOf(content).traits.get('dwarven-toughness')?.summary).toBeUndefined();
    expect(toughness.summary).toBe(
      'Ваш максимум хитов увеличивается на 1 и увеличивается ещё на 1 с каждым новым уровнем.',
    );
    expect(toughness.text.startsWith(toughness.summary)).toBe(true);
  });
});

describe('describeBackground и совместимость с классом', () => {
  test('преступник подходит плуту (Ловкость), черта — Бдительность', () => {
    const criminal = describeBackground('criminal', content, 'rogue')!;
    expect(criminal.fit).toEqual({ classId: 'rogue', ability: 'dex' });
    expect(criminal.feat?.id).toBe('alert');
    expect(criminal.skills).toEqual(['skill-sleight-of-hand', 'skill-stealth']);
    expect(criminal.tools).toEqual(['tool-thieves-tools']);
  });

  test('предыстория без основной характеристики класса не подходит', () => {
    const { backgrounds, classes } = indexOf(content);
    // Мудрец: ТЕЛ, ИНТ, МДР — у плута основная ЛОВ.
    expect(backgroundFits(backgrounds.get('sage')!, classes.get('rogue'))).toEqual([]);
    expect(describeBackground('sage', content, 'rogue')?.fit).toBeUndefined();
  });

  test('подходящие классу — первыми', () => {
    const { fitting, other } = backgroundsForClass(content, 'rogue');
    expect(fitting).toContain('criminal');
    expect(other).toContain('sage');
    expect(fitting.length + other.length).toBe(content.backgrounds.length);
  });

  test('2014: без характеристик и черты, есть умение предыстории и языки', () => {
    const acolyte = describeBackground('acolyte', content2014, 'cleric')!;
    expect(acolyte.abilities).toEqual([]);
    expect(acolyte.fit).toBeUndefined();
    expect(acolyte.feature?.name).not.toBe('');
    expect(acolyte.languages).toBe(2);
  });
});

describe('describeSpecies', () => {
  test('дварф 2024: тёмное зрение 120 фт, особенности', () => {
    const dwarf = describeSpecies('dwarf', content)!;
    expect(dwarf.darkvision).toBe(120);
    expect(dwarf.speed).toBe(30);
    expect(dwarf.traits.map((t) => t.id)).toContain('dwarven-toughness');
    expect(dwarf.pitch).not.toBe('');
  });

  test('2014: подраса добавляет прибавки и особенности, меняет скорость', () => {
    const woodElf = describeSpecies('elf', content2014, { subspeciesId: 'wood-elf' })!;
    expect(woodElf.abilityBonuses).toEqual({ dex: 2, wis: 1 });
    expect(woodElf.speed).toBe(35);
    expect(woodElf.subspecies?.id).toBe('wood-elf');
    expect(woodElf.languages).toEqual(['common', 'elvish']);
    expect(describeSpecies('elf', content2014, { subspeciesId: 'dark-elf' })?.darkvision).toBe(120);
  });

  test('2014: подраса тифлинга заменяет прибавки и «Наследие Ада»', () => {
    const zariel = describeSpecies('tiefling', content2014, { subspeciesId: 'tiefling-zariel' })!;
    expect(zariel.abilityBonuses).toEqual({ cha: 2, str: 1 });
    expect(zariel.traits.map((t) => t.id)).not.toContain('infernal-legacy');
    expect(zariel.traits.map((t) => t.id)).toContain('legacy-of-avernus');
  });

  test('2014: выбранный драконий предок вместо общей особенности', () => {
    const red = describeSpecies('dragonborn', content2014, { variantTraitId: 'draconic-ancestry-red' })!;
    expect(red.traits.map((t) => t.id)).toContain('draconic-ancestry-red');
    expect(red.traits.map((t) => t.id)).not.toContain('draconic-ancestry');
  });
});

describe('describeSubclass', () => {
  test('чемпион на 3-м уровне: умение 3-го уровня сейчас, остальные — в «Что дальше»', () => {
    const champion = describeSubclass('champion', content, 3)!;
    expect(champion.classId).toBe('fighter');
    expect(champion.now.map((f) => f.id)).toEqual(['champion-improved-critical', 'champion-remarkable-athlete']);
    expect(champion.next.map((row) => row.level)).toEqual([7, 10, 15, 18]);
    expect(champion.pitch).not.toBe('');
    expect(champion.spells).toEqual([]);
  });

  test('подкласс не из SRD: метка extra, описание не повторяет суть', () => {
    const battleMaster = describeSubclass('battle-master', content, 3)!;
    expect(battleMaster.extra).toBe(true);
    expect(battleMaster.pitch).toBe('');
  });

  test('2014: заклинания клятвы преданности по уровням класса', () => {
    const devotion = describeSubclass('devotion', content2014, 3)!;
    expect(devotion.spells[0].level).toBe(3);
    expect(devotion.spells[0].names.length).toBeGreaterThan(0);
  });

  test('2014: заклинания Круга земли по местности не показываются', () => {
    expect(describeSubclass('land', content2014, 2)!.spells).toEqual([]);
  });
});
