import { contentFor, indexOf } from '@/shared/content';

import { languageChoiceCount, originFeats, proficiencySlots } from '../build';
import { newDraftCharacter } from '../character';
import { characterResources } from '../resources';
import { computeSheet, finalAbilityScores } from '../sheet';
import { speciesSpellcasting } from '../speciesSpells';
import type { Character } from '../types';

const content = contentFor('2014');
const idx = indexOf(content);

function make(patch: Partial<Character>): Character {
  return {
    ...newDraftCharacter('t', 'now', '2014'),
    backgroundId: 'acolyte',
    classes: [{ classId: 'fighter', level: 1 }],
    baseAbilities: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    status: { kind: 'ready' },
    ...patch,
  };
}

describe('PHB 2014: подрасы', () => {
  test('лесной эльф: МДР +1, скорость 35, эльфийское оружие', () => {
    const c = make({ speciesId: 'elf', subspeciesId: 'wood-elf', equipment: [{ itemId: 'longbow', quantity: 1 }] });
    const sheet = computeSheet(c, content);
    expect(finalAbilityScores(c, content)).toMatchObject({ dex: 12, wis: 11 });
    expect(sheet.speed).toBe(35);
    expect(idx.species.get('elf')?.subspecies).toEqual(['high-elf', 'wood-elf', 'dark-elf']);
  });

  test('горный дварф: СИЛ +2, средние доспехи', () => {
    const c = make({ speciesId: 'dwarf', subspeciesId: 'mountain-dwarf', classes: [{ classId: 'wizard', level: 1 }] });
    expect(finalAbilityScores(c, content)).toMatchObject({ str: 12, con: 12 });
    expect(computeSheet(c, content).proficiencies).toEqual(expect.arrayContaining(['light-armor', 'medium-armor']));
  });

  test('дроу: заклинания по уровням, Харизма', () => {
    const at = (level: number) =>
      speciesSpellcasting(
        make({ speciesId: 'elf', subspeciesId: 'dark-elf', classes: [{ classId: 'fighter', level }] }),
        content,
      );
    expect(at(1)).toMatchObject({ ability: 'cha', spells: [{ spellId: 'dancing-lights' }] });
    expect(at(3)?.spells.map((s) => s.spellId)).toEqual(['dancing-lights', 'faerie-fire']);
    expect(at(5)?.spells.map((s) => s.spellId)).toEqual(['dancing-lights', 'faerie-fire', 'darkness']);
  });

  test('тифлинг: «Наследие Ада» — «Чудотворство», с 3-го «Адское возмездие», с 5-го «Тьма»', () => {
    const at = (level: number) =>
      speciesSpellcasting(
        make({ speciesId: 'tiefling', classes: [{ classId: 'fighter', level }] }),
        content,
      )?.spells.map((s) => s.spellId);
    expect(at(1)).toEqual(['thaumaturgy']);
    expect(at(5)).toEqual(['thaumaturgy', 'hellish-rebuke', 'darkness']);
  });

  test('лесной гном: «Малая иллюзия» Интеллектом', () => {
    expect(speciesSpellcasting(make({ speciesId: 'gnome', subspeciesId: 'forest-gnome' }), content)).toMatchObject({
      ability: 'int',
      spells: [{ spellId: 'minor-illusion' }],
    });
  });
});

describe('PHB 2014: человек-вариант', () => {
  const base = make({ speciesId: 'human-variant', choices: { 'trait.abilityBonus': ['str', 'con'] } });

  test('+1 к двум, навык на выбор, черта на 1-м уровне, язык на выбор', () => {
    expect(finalAbilityScores(base, content)).toMatchObject({ str: 11, con: 11, dex: 10 });
    expect(
      proficiencySlots(base, content).some((s) => s.key === 'trait.variant-human-skill.prof.0' && s.choose === 1),
    ).toBe(true);
    expect(originFeats(base, content)).toEqual([expect.objectContaining({ slot: 'versatile' })]);
    // 1 от человека + 1 от «Прислужника» ×2
    expect(languageChoiceCount(base, content)).toBe(3);
  });
});

describe('PHB 2014: предыстории', () => {
  test('12 предысторий PHB + «Прислужник»', () => {
    expect(content.backgrounds).toHaveLength(13);
    expect(idx.backgrounds.get('criminal')).toMatchObject({
      abilities: [],
      proficiencies: ['skill-deception', 'skill-stealth', 'tool-thieves-tools'],
    });
  });

  test('мудрец — два языка, солдат — игровой набор на выбор', () => {
    expect(languageChoiceCount(make({ speciesId: 'dwarf', backgroundId: 'sage' }), content)).toBe(2);
    const soldier = make({ speciesId: 'dwarf', backgroundId: 'soldier' });
    expect(proficiencySlots(soldier, content).find((s) => s.source === 'background')?.options).toEqual([
      'tool-dice',
      'tool-playing-cards',
    ]);
  });
});

describe('2014: расы других книг (как в списке 2024)', () => {
  test('список рас: как в 2024 плюс полуэльф, полуорк и человек-вариант, без кхоравара', () => {
    expect(content.species.map((s) => s.id)).toEqual([
      'dragonborn',
      'dwarf',
      'elf',
      'gnome',
      'goliath',
      'half-elf',
      'half-orc',
      'halfling',
      'human',
      'human-variant',
      'orc',
      'tiefling',
      'aasimar',
      'dhampir',
      'kalashtar',
      'warforged',
      'changeling',
      'shifter',
    ]);
  });

  test('голиаф: СИЛ +2, ТЕЛ +1, Атлетика, «Выносливость камня» до короткого отдыха', () => {
    const c = make({ speciesId: 'goliath' });
    expect(finalAbilityScores(c, content)).toMatchObject({ str: 12, con: 11 });
    expect(computeSheet(c, content).proficiencies).toContain('skill-athletics');
    expect(characterResources(c, content)).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: 'stones-endurance', max: 1, recovery: 'short' })]),
    );
  });

  test('орк: СИЛ +2, ТЕЛ +1, ИНТ −2, Запугивание', () => {
    const c = make({ speciesId: 'orc' });
    expect(finalAbilityScores(c, content)).toMatchObject({ str: 12, con: 11, int: 8 });
    expect(computeSheet(c, content).proficiencies).toContain('skill-intimidation');
  });

  test('аасимар-защитник: ХАР +2, МДР +1, «Свет» Харизмой, преображение с 3-го уровня', () => {
    const at = (level: number) =>
      make({ speciesId: 'aasimar', subspeciesId: 'aasimar-protector', classes: [{ classId: 'fighter', level }] });
    expect(finalAbilityScores(at(1), content)).toMatchObject({ cha: 12, wis: 11 });
    expect(speciesSpellcasting(at(1), content)).toMatchObject({ ability: 'cha', spells: [{ spellId: 'light' }] });
    const race = (level: number) =>
      characterResources(at(level), content).filter((r) => r.id !== 'second-wind' && r.id !== 'action-surge');
    expect(race(1).map((r) => r.id)).toEqual(['healing-hands']);
    expect(race(3).map((r) => r.id)).toEqual(['healing-hands', 'aasimar-transformation']);
  });

  test('кованый: ТЕЛ +2 и +1 на выбор, +1 к КЗ, навык и инструмент на выбор', () => {
    const c = make({ speciesId: 'warforged', choices: { 'trait.abilityBonus': ['str'] } });
    expect(finalAbilityScores(c, content)).toMatchObject({ con: 12, str: 11 });
    expect(computeSheet(c, content).armorClass).toBe(11);
    const tools = proficiencySlots(c, content).find((s) => s.key === 'trait.specialized-design.prof.1');
    expect(tools?.options).toEqual(expect.arrayContaining(['tool-thieves-tools', 'lute', 'herbalism-kit']));
    expect(tools?.options).not.toContain('land-vehicles');
  });

  test('ченджлинг: два навыка из списка и два языка', () => {
    const c = make({ speciesId: 'changeling', choices: { 'trait.abilityBonus': ['dex'] } });
    expect(finalAbilityScores(c, content)).toMatchObject({ cha: 12, dex: 11 });
    expect(proficiencySlots(c, content).find((s) => s.key === 'trait.changeling-instincts.prof.0')?.choose).toBe(2);
    // 2 от ченджлинга + 2 от «Прислужника»
    expect(languageChoiceCount(c, content)).toBe(4);
  });

  test('шифтер-длиннозубый: СИЛ +2, ЛОВ +1, Запугивание, «Смена облика» до короткого отдыха', () => {
    const c = make({ speciesId: 'shifter', subspeciesId: 'shifter-longtooth' });
    expect(finalAbilityScores(c, content)).toMatchObject({ str: 12, dex: 11 });
    expect(computeSheet(c, content).proficiencies).toContain('skill-intimidation');
    expect(characterResources(c, content)).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: 'shifting', max: 1, recovery: 'short' })]),
    );
  });

  test('дампир: скорость 35, +1 к трём на выбор, укус — БМ раз', () => {
    const c = make({ speciesId: 'dhampir', choices: { 'trait.abilityBonus': ['str', 'dex', 'con'] } });
    expect(finalAbilityScores(c, content)).toMatchObject({ str: 11, dex: 11, con: 11 });
    expect(computeSheet(c, content).speed).toBe(35);
    expect(characterResources(c, content)).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: 'vampiric-bite', max: 2, recovery: 'long' })]),
    );
  });
});

describe('2014: подрасы тифлинга (Mordenkainen’s Tome of Foes)', () => {
  const at = (subspeciesId: string | undefined, level = 1) =>
    make({ speciesId: 'tiefling', subspeciesId, classes: [{ classId: 'fighter', level }] });

  test('подраса заменяет прибавки расы и «Наследие Ада»', () => {
    const zariel = at('tiefling-zariel', 5);
    expect(finalAbilityScores(zariel, content)).toMatchObject({ cha: 12, str: 11, int: 10 });
    expect(computeSheet(zariel, content).features.map((f) => f.id)).not.toContain('infernal-legacy');
    expect(speciesSpellcasting(zariel, content)).toMatchObject({ ability: 'cha' });
    expect(speciesSpellcasting(zariel, content)?.spells.map((s) => s.spellId)).toEqual([
      'thaumaturgy',
      'searing-smite',
      'branding-smite',
    ]);
  });

  test('заклинания PHB вне SRD — с кругом и не в списках классов', () => {
    expect(idx.spells.get('searing-smite')).toMatchObject({ level: 1, classes: [], extra: true });
    expect(idx.spells.get('crown-of-madness')?.level).toBe(2);
    expect(idx.spells.get('friends')?.level).toBe(0);
  });

  test('Асмодей — как тифлинг PHB; тифлинг без подрасы (старые персонажи) не меняется', () => {
    expect(finalAbilityScores(at('tiefling-asmodeus'), content)).toMatchObject({ cha: 12, int: 11 });
    expect(finalAbilityScores(at(undefined), content)).toMatchObject({ cha: 12, int: 11 });
    expect(speciesSpellcasting(at(undefined, 5), content)?.spells.map((s) => s.spellId)).toEqual([
      'thaumaturgy',
      'hellish-rebuke',
      'darkness',
    ]);
    expect(idx.species.get('tiefling')?.subspecies).toHaveLength(9);
  });
});
