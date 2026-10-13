import { content, contentFor, indexOf } from '../content';

const c14 = contentFor('2014');
const idx = indexOf(c14);

describe('справочник 2014 (SRD 5.1)', () => {
  test('редакции различаются, 2024 — основной справочник', () => {
    expect(contentFor('2024')).toBe(content);
    expect(content.edition).toBe('2024');
    expect(c14.edition).toBe('2014');
  });

  test('прибавки расы и подрасы: эльф ЛОВ +2, высший эльф ИНТ +1', () => {
    expect(idx.species.get('elf')?.abilityBonuses).toEqual({ dex: 2 });
    expect(idx.subspecies.get('high-elf')?.abilityBonuses).toEqual({ int: 1 });
  });

  test('полуэльф: ХАР +2 и +1 к двум другим на выбор, язык на выбор', () => {
    const halfElf = idx.species.get('half-elf')!;
    expect(halfElf.abilityBonuses).toEqual({ cha: 2 });
    expect(halfElf.abilityBonusChoice).toEqual({ choose: 2, bonus: 1, options: ['str', 'dex', 'con', 'int', 'wis'] });
    expect(halfElf.languageChoice?.choose).toBe(1);
  });

  test('предыстория без прибавок и черты, с умением и двумя языками', () => {
    const acolyte = idx.backgrounds.get('acolyte')!;
    expect(acolyte.abilities).toEqual([]);
    expect(acolyte.featId).toBeUndefined();
    expect(acolyte.feature?.name.en).toBe('Shelter of the Faithful');
    expect(acolyte.languageChoice?.choose).toBe(2);
    expect(acolyte.languageChoice?.options).toHaveLength(c14.languages.length);
  });

  test('инструменты — с теми же id, что в 2024', () => {
    expect(idx.proficiencies.get('tool-thieves-tools')?.type).toBe('tool');
    expect(idx.classes.get('rogue')?.proficiencies).toContain('tool-thieves-tools');
    expect(idx.proficiencies.has('thieves-tools')).toBe(false);
  });

  test('известные и подготовленные заклинания', () => {
    const bard = idx.classes.get('bard')!;
    expect(bard.spellcasting?.preparation).toBe('known');
    expect(bard.levels[0].spellcasting).toMatchObject({ cantrips: 2, known: 4 });
    expect(idx.classes.get('wizard')?.spellcasting?.preparation).toBe('prepared');
  });

  test('подкласс с 1-го уровня и заклинаниями домена', () => {
    const life = idx.subclasses.get('life')!;
    expect(idx.features.get(life.features[0])?.level).toBe(1);
    expect(life.spells).toContainEqual({ id: 'bless', level: 1 });
  });

  test('урон и лечение заклинаний', () => {
    expect(idx.spells.get('fireball')?.damage?.bySlotLevel?.['4']).toBe('9d6');
    expect(idx.spells.get('eldritch-blast')?.damage?.beams).toBe(true);
    expect(idx.spells.get('cure-wounds')?.damage).toMatchObject({ kind: 'heal', addModifier: true });
  });

  test('приёмов оружия нет', () => {
    expect(c14.weaponMasteries).toEqual([]);
  });
});
