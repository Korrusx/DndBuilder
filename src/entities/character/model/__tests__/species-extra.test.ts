import { content } from '@/shared/content';

import { irmaLevel1, irmaLevel5 } from '../../lib/samples';
import { proficiencySlots } from '../build';
import { characterResources } from '../resources';
import { computeSheet } from '../sheet';

// Виды не из SRD (data-pipeline/extra/species.json) на примере Ирмы: меняем только вид.

describe('виды не из SRD', () => {
  test('в справочнике 16 видов: 9 из SRD и 7 дополнительных', () => {
    expect(content.species).toHaveLength(16);
    expect(content.species.filter((s) => s.extra).map((s) => s.id)).toEqual([
      'aasimar', 'dhampir', 'kalashtar', 'warforged', 'khoravar', 'changeling', 'shifter',
    ]);
  });

  test('Кованый: +1 к КЗ, выбор навыка и инструмента', () => {
    const irma = { ...irmaLevel1(), speciesId: 'warforged', size: 'Medium' };
    expect(computeSheet(irma, content).armorClass).toBe(15); // кожаный доспех 11 + ЛОВ 3 + 1
    const slots = proficiencySlots(irma, content).filter((s) => s.source === 'species');
    expect(slots.map((s) => s.choose)).toEqual([1, 1]);
    expect(slots[0].options).toContain('skill-athletics');
    expect(slots[1].options).toContain('tool-thieves-tools');
  });

  test('Дампир: скорость 35 фт', () => {
    const irma = { ...irmaLevel1(), speciesId: 'dhampir', size: 'Medium' };
    expect(computeSheet(irma, content).speed).toBe(35);
  });

  test('Шифтер: «Смена облика» — столько раз, каков БМ; особенность наследия в листе', () => {
    const irma = { ...irmaLevel5(), speciesId: 'shifter', subspeciesId: 'shifter-longtooth', size: 'Medium' };
    const sheet = computeSheet(irma, content);
    expect(sheet.features).toContainEqual({ id: 'longtooth-shift', source: 'species' });
    expect(characterResources(irma, content, sheet).find((r) => r.id === 'shifting')?.max).toBe(3);
  });

  test('Аасимар: «Небесное откровение» — с 3-го уровня', () => {
    const at1 = { ...irmaLevel1(), speciesId: 'aasimar', size: 'Medium' };
    const at5 = { ...irmaLevel5(), speciesId: 'aasimar', size: 'Medium' };
    const ids = (c: typeof at1) => characterResources(c, content).map((r) => r.id);
    expect(ids(at1)).toContain('healing-hands');
    expect(ids(at1)).not.toContain('celestial-revelation');
    expect(ids(at5)).toContain('celestial-revelation');
  });
});
