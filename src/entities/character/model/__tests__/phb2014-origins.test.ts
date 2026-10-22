import { contentFor, indexOf } from '@/shared/content';

import { languageChoiceCount, originFeats, proficiencySlots } from '../build';
import { newDraftCharacter } from '../character';
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
