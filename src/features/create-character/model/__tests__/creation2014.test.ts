import type { Character } from '@/entities/character';
import {
  CHOICE_KEYS,
  computeSheet,
  equipmentChoices,
  featureChoices,
  knownLanguages,
  languageChoiceCount,
  newDraftCharacter,
  setBackground,
  setClass,
  setEdition,
  setSpecies,
  setSubclass,
  spellLimits,
  speciesSpellcasting,
  startingKit,
  subclassLevel,
} from '@/entities/character';
import { activeEdition, byId, contentFor, nameOf, setActiveEdition } from '@/shared/content';

import { draftIssues, finishCharacter } from '../validation';

const content = contentFor('2014');
const blocking = (c: Character) => draftIssues(c, content).filter((i) => i.blocking);

/** Высший эльф, волшебник, «Прислужник» — собран через мастер 2014. */
function elfWizard(): Character {
  let c = setEdition({ ...newDraftCharacter('t', '2026-01-01T00:00:00.000Z'), name: 'Эльвин' }, '2014');
  c = setClass(c, 'wizard');
  c = setBackground(c, 'acolyte');
  c = setSpecies(c, 'elf', content);
  return {
    ...c,
    subspeciesId: 'high-elf',
    abilityMethod: 'standard',
    baseAbilities: { str: 8, dex: 13, con: 14, int: 15, wis: 12, cha: 10 },
    choices: {
      ...c.choices,
      [CHOICE_KEYS.traitSpell('high-elf-cantrip')]: ['fire-bolt'],
      [CHOICE_KEYS.classProf('wizard', 0)]: ['skill-arcana', 'skill-history'],
      // Шаг 5: посох, компонентный мешочек, набор учёного; священный символ предыстории.
      [CHOICE_KEYS.equipment('class', 1)]: ['0'],
      [CHOICE_KEYS.equipment('class', 2)]: ['0'],
      [CHOICE_KEYS.equipment('class', 3)]: ['0'],
      [CHOICE_KEYS.equipmentPick('background', 0, 1)]: ['amulet'],
      [CHOICE_KEYS.spellbook]: ['burning-hands', 'charm-person', 'detect-magic', 'mage-armor', 'magic-missile', 'shield'],
    },
    // Языки: 2 от «Прислужника» + 1 от «Дополнительного языка» высшего эльфа.
    languages: ['common', 'dwarvish', 'draconic', 'celestial'],
    cantrips: ['mage-hand', 'light', 'prestidigitation'],
    // ИНТ 15 + 1 (высший эльф) = 16 → +3; волшебник 1 готовит 3 + 1.
    preparedSpells: ['mage-armor', 'magic-missile', 'shield', 'detect-magic'],
  };
}

describe('мастер создания 2014', () => {
  test('смена редакции начинает черновик заново, имя остаётся', () => {
    const c = setEdition({ ...newDraftCharacter('t', 'now'), name: 'Эльвин', speciesId: 'elf', classes: [{ classId: 'wizard', level: 1 }] }, '2014');
    expect(c).toMatchObject({ edition: '2014', name: 'Эльвин', speciesId: '', classes: [] });
  });

  test('подкласс с 1-го уровня — у жреца, чародея, колдуна 2014', () => {
    expect(subclassLevel('cleric', content)).toBe(1);
    expect(subclassLevel('sorcerer', content)).toBe(1);
    expect(subclassLevel('rogue', content)).toBe(3);
    expect(subclassLevel('cleric', contentFor('2024'))).toBe(3);
    const cleric = setClass(setEdition(newDraftCharacter('t', 'now'), '2014'), 'cleric');
    expect(blocking(cleric).map((i) => i.message)).toContain('Не выбран подкласс');
    expect(blocking(setSubclass(cleric, 'life')).some((i) => i.step === 1)).toBe(false);
  });

  test('полный путь: эльф-волшебник готов без замечаний', () => {
    expect(blocking(elfWizard())).toEqual([]);
  });

  test('чего не хватает: заговор эльфа, языки, прибавки полуэльфа', () => {
    const c = elfWizard();
    const noCantrip = { ...c, choices: { ...c.choices, [CHOICE_KEYS.traitSpell('high-elf-cantrip')]: [] } };
    expect(blocking(noCantrip).map((i) => i.step)).toEqual([2]);
    expect(languageChoiceCount(c, content)).toBe(3);
    expect(blocking({ ...c, languages: ['common', 'dwarvish'] }).map((i) => i.step)).toEqual([4]);
    const halfElf = { ...setSpecies(c, 'half-elf', content), languages: ['common', 'dwarvish', 'draconic', 'celestial'] };
    expect(blocking(halfElf).map((i) => i.message)).toContain('Выберите прибавки расы: 2');
  });

  test('2014: бонусы предыстории не нужны, языки расы известны', () => {
    const c = elfWizard();
    expect(blocking(c).some((i) => i.step === 3)).toBe(false);
    expect(knownLanguages(c, content)).toEqual(expect.arrayContaining(['common', 'elvish', 'dwarvish', 'draconic', 'celestial']));
  });

  test('снаряжение из нескольких выборов и предмет из категории', () => {
    const c = elfWizard();
    expect(equipmentChoices(c, content, 'class')).toHaveLength(4);
    const kit = startingKit(c, content);
    // Квартерстаф автоматически надевается в слот основной руки (новая модель equippedSlots).
    const allIds = [...kit.items.map((i) => i.itemId), ...Object.values(kit.equippedSlots)];
    expect(allIds).toEqual(
      expect.arrayContaining(['spellbook', 'quarterstaff', 'component-pouch', 'scholars-pack', 'amulet', 'clothes-common', 'pouch']),
    );
    expect(kit.coins).toEqual({ gp: 15 });
    // Без выбора священного символа шаг 5 не готов.
    const noSymbol = { ...c, choices: { ...c.choices, [CHOICE_KEYS.equipmentPick('background', 0, 1)]: [] } };
    expect(blocking(noSymbol).map((i) => i.step)).toEqual([5]);
  });

  test('два воинских оружия: в выборе два предмета', () => {
    let c = setClass(setEdition(newDraftCharacter('t', 'now'), '2014'), 'fighter');
    c = { ...c, choices: { ...c.choices, [CHOICE_KEYS.equipment('class', 1)]: ['1'], [CHOICE_KEYS.equipmentPick('class', 0, 1)]: ['longsword', 'battleaxe'] } };
    const kit2 = startingKit(c, content);
    const allIds2 = [...kit2.items.map((i) => i.itemId), ...Object.values(kit2.equippedSlots)];
    expect(allIds2).toEqual(expect.arrayContaining(['longsword', 'battleaxe']));
  });

  test('боевой стиль воина — вариант умения на шаге 4', () => {
    const c = setClass(setEdition(newDraftCharacter('t', 'now'), '2014'), 'fighter');
    expect(featureChoices(c, content)).toEqual([expect.objectContaining({ featureId: 'fighter-fighting-style', choose: 1 })]);
  });

  test('заговор высшего эльфа — Интеллектом; лимиты заклинаний; готовый персонаж', () => {
    const c = elfWizard();
    const sheet = computeSheet(c, content);
    expect(speciesSpellcasting(c, content, sheet)).toMatchObject({ ability: 'int', spells: [{ spellId: 'fire-bolt', level: 0 }] });
    expect(spellLimits(c, content)).toMatchObject({ cantrips: 3, prepared: 4 });
    expect(finishCharacter(c, content)).toMatchObject({ status: { kind: 'ready' }, state: { currentHp: 6 + 2 } });
  });
});

describe('активная редакция', () => {
  afterEach(() => setActiveEdition('2024'));

  test('экраны персонажа 2014 видят справочник 2014', () => {
    expect(activeEdition()).toBe('2024');
    expect(byId.species.has('half-elf')).toBe(false);
    setActiveEdition('2014');
    expect(byId.species.has('half-elf')).toBe(true);
    expect(nameOf('species', 'half-elf')).not.toBe('half-elf');
    setActiveEdition('2024');
    expect(byId.species.has('half-elf')).toBe(false);
  });
});
