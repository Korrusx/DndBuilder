import { content } from '@/shared/content';

import { CHOICE_KEYS } from '../../config/constants';
import { irmaLevel1, irmaLevel5 } from '../../lib/samples';
import { needsSpeciesSpellAbility, speciesSpellcasting } from '../speciesSpells';

const ids = (c: Parameters<typeof speciesSpellcasting>[0]) => speciesSpellcasting(c, content)?.spells.map((s) => s.spellId);
const as = (c: ReturnType<typeof irmaLevel1>, speciesId: string, subspeciesId?: string, choices: Record<string, string[]> = {}) => ({
  ...c,
  speciesId,
  subspeciesId,
  size: 'Medium',
  choices: { ...c.choices, ...choices },
});

describe('заклинания вида', () => {
  test('тифлинг (инфернальное наследие): на 1-м уровне — заговоры, на 5-м — ещё два заклинания', () => {
    expect(ids(as(irmaLevel1(), 'tiefling', 'fiendish-legacy-infernal'))).toEqual(['thaumaturgy', 'fire-bolt']);
    const at5 = speciesSpellcasting(as(irmaLevel5(), 'tiefling', 'fiendish-legacy-infernal'), content)!;
    expect(at5.spells.map((s) => [s.spellId, s.level, s.freeUses])).toEqual([
      ['thaumaturgy', 0, 0],
      ['fire-bolt', 0, 0],
      ['hellish-rebuke', 1, 1],
      ['darkness', 2, 1],
    ]);
  });

  test('характеристику выбирают эльф, гном и тифлинг; от неё СЛ и атака', () => {
    const tiefling = as(irmaLevel1(), 'tiefling', 'fiendish-legacy-infernal');
    expect(needsSpeciesSpellAbility(tiefling, content)).toBe(true);
    expect(speciesSpellcasting(tiefling, content)?.ability).toBeUndefined();
    const withInt = { ...tiefling, choices: { ...tiefling.choices, [CHOICE_KEYS.speciesSpellAbility]: ['int'] } };
    expect(speciesSpellcasting(withInt, content)).toMatchObject({ ability: 'int', saveDC: 12, attackBonus: 4 }); // ИНТ 14, БМ 2
    expect(needsSpeciesSpellAbility(irmaLevel1(), content)).toBe(false); // полурослик
  });

  test('аасимар: «Свет» на Харизме без выбора', () => {
    const aasimar = as(irmaLevel1(), 'aasimar');
    expect(needsSpeciesSpellAbility(aasimar, content)).toBe(false);
    expect(speciesSpellcasting(aasimar, content)).toMatchObject({ ability: 'cha', spells: [{ spellId: 'light' }] });
  });

  test('лесной гном: «Разговор с животными» без ячейки столько раз, каков БМ', () => {
    const gnome = speciesSpellcasting(as(irmaLevel5(), 'gnome', 'gnomish-lineage-forest-gnome'), content)!;
    expect(gnome.spells.find((s) => s.spellId === 'speak-with-animals')?.freeUses).toBe(3);
  });

  test('высший эльф: «Фокусы» можно заменить заговором волшебника', () => {
    const elf = as(irmaLevel1(), 'elf', 'elven-lineage-high-elf');
    expect(speciesSpellcasting(elf, content)?.spells[0]).toMatchObject({ spellId: 'prestidigitation', swapList: 'wizard' });
    const swapped = { ...elf, choices: { ...elf.choices, [CHOICE_KEYS.speciesCantrip('high-elf-cantrip-versatility')]: ['fire-bolt'] } };
    expect(ids(swapped)).toEqual(['fire-bolt']);
  });

  test('у полурослика и человека заклинаний вида нет', () => {
    expect(speciesSpellcasting(irmaLevel1(), content)).toBeNull();
    expect(speciesSpellcasting(as(irmaLevel1(), 'human'), content)).toBeNull();
  });
});
