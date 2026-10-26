import { byId, setActiveEdition } from '@/shared/content';

import { speciesVariantTrait, variantOptions } from '../raceVariants';

describe('панель вариантов под карточкой расы', () => {
  afterAll(() => setActiveEdition('2024'));

  test('2014: драконий предок — варианты особенности, а не подрасы', () => {
    setActiveEdition('2014');
    const dragonborn = byId.species.get('dragonborn')!;
    expect(speciesVariantTrait(dragonborn)?.id).toBe('draconic-ancestry');
    const options = variantOptions(dragonborn);
    expect(options).toHaveLength(10);
    expect(options[0]).toMatchObject({ id: 'draconic-ancestry-black', name: 'Чёрный' });
    expect(options[0].traits).toContain('кислота');
  });

  test('2014: эльф и тифлинг — подрасы; голиаф — без вариантов', () => {
    setActiveEdition('2014');
    expect(variantOptions(byId.species.get('elf')!).map((o) => o.id)).toEqual(['high-elf', 'wood-elf', 'dark-elf']);
    expect(speciesVariantTrait(byId.species.get('elf')!)).toBeUndefined();
    expect(variantOptions(byId.species.get('tiefling')!)[0]).toMatchObject({
      name: 'Асмодей',
      bonuses: 'ХАР +2, ИНТ +1',
    });
    expect(variantOptions(byId.species.get('goliath')!)).toEqual([]);
  });
});
