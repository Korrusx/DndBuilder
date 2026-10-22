import { contentFor, indexOf } from '@/shared/content';

import { proficiencySlots } from '../build';
import { newDraftCharacter } from '../character';
import { characterResources } from '../resources';
import { computeSheet, subclassSpellIds } from '../sheet';
import { preparableSpells } from '../spellbook';
import type { Character } from '../types';

const content = contentFor('2014');
const idx = indexOf(content);

function make(classId: string, level: number, subclassId: string, patch: Partial<Character> = {}): Character {
  return {
    ...newDraftCharacter('t', 'now', '2014'),
    speciesId: 'human',
    backgroundId: 'acolyte',
    baseAbilities: { str: 14, dex: 14, con: 14, int: 14, wis: 14, cha: 14 },
    classes: [{ classId, level, subclassId }],
    status: { kind: 'ready' },
    ...patch,
  };
}

describe('подклассы PHB 2014', () => {
  test('у каждого класса есть подклассы PHB; всего 40', () => {
    expect(content.subclasses).toHaveLength(12 + 28);
    expect(idx.classes.get('cleric')?.subclasses).toEqual([
      'life',
      'knowledge',
      'light',
      'nature',
      'tempest',
      'trickery',
      'war',
    ]);
    expect(idx.classes.get('wizard')?.subclasses).toHaveLength(8);
  });

  test('уровень подкласса не изменился: жрец — 1, волшебник — 2, воин — 3', () => {
    const first = (classId: string) =>
      Math.min(
        ...(idx.classes.get(classId)?.subclasses ?? []).flatMap((s) =>
          idx.subclasses.get(s)!.features.map((f) => idx.features.get(f)!.level),
        ),
      );
    expect(first('cleric')).toBe(1);
    expect(first('wizard')).toBe(2);
    expect(first('fighter')).toBe(3);
  });

  test('домен бури: воинское оружие и тяжёлые доспехи, заклинания домена', () => {
    const sheet = computeSheet(make('cleric', 3, 'tempest'), content);
    expect(sheet.proficiencies).toEqual(expect.arrayContaining(['martial-weapons', 'heavy-armor']));
    expect(sheet.subclassSpells).toEqual(['fog-cloud', 'thunderwave', 'gust-of-wind', 'shatter']);
  });

  test('домен жизни (SRD): тяжёлые доспехи', () => {
    expect(computeSheet(make('cleric', 1, 'life'), content).proficiencies).toContain('heavy-armor');
  });

  test('домен знаний: два навыка на выбор при создании', () => {
    const slot = proficiencySlots(make('cleric', 1, 'knowledge'), content).find((s) =>
      s.key.startsWith('feature.knowledge-'),
    );
    expect(slot).toMatchObject({
      choose: 2,
      options: ['skill-arcana', 'skill-history', 'skill-nature', 'skill-religion'],
    });
  });

  test('клятва мести: заклинания с 3-го уровня паладина', () => {
    expect(subclassSpellIds(make('paladin', 3, 'vengeance'), content)).toEqual(['bane', 'hunters-mark']);
  });

  test('колдун: расширенный список — среди вариантов, но не «всегда подготовлены»', () => {
    const fiend = make('warlock', 1, 'fiend');
    expect(subclassSpellIds(fiend, content)).toEqual([]);
    expect(preparableSpells(fiend, content, 'warlock', 1)).toContain('burning-hands');
    expect(preparableSpells(make('warlock', 1, 'great-old-one'), content, 'warlock', 1)).toContain('hideous-laughter');
  });

  test('мастер боевых искусств: 4 кости превосходства к8, на 10-м — к10', () => {
    expect(
      characterResources(make('fighter', 3, 'battle-master'), content).find((r) => r.id === 'superiority-dice'),
    ).toMatchObject({
      max: 4,
      die: 8,
      recovery: 'short',
    });
    expect(
      characterResources(make('fighter', 10, 'battle-master'), content).find((r) => r.id === 'superiority-dice'),
    ).toMatchObject({ max: 5, die: 10 });
  });

  test('коллегия доблести на 3-м: средние доспехи, щиты, воинское оружие', () => {
    expect(computeSheet(make('bard', 3, 'valor'), content).proficiencies).toEqual(
      expect.arrayContaining(['medium-armor', 'shields', 'martial-weapons']),
    );
    expect(computeSheet(make('bard', 2, 'valor'), content).proficiencies).not.toContain('medium-armor');
  });
});
