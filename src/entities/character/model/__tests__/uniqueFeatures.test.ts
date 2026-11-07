import { content } from '@/shared/content';

import { irmaLevel1 } from '../../lib/samples';
import { computeSheet, uniqueFeatures } from '../sheet';

describe('uniqueFeatures', () => {
  test('плут 6: «Компетентность» с 1-го и 6-го уровня — в листе один раз', () => {
    const irma = { ...irmaLevel1(), classes: [{ classId: 'rogue', subclassId: 'thief', level: 6 }] };
    const features = computeSheet(irma, content).features;
    expect(features.filter((f) => f.id === 'rogue-expertise')).toHaveLength(2);
    const shown = uniqueFeatures(features);
    expect(shown.filter((f) => f.id === 'rogue-expertise')).toHaveLength(1);
    expect(new Set(shown.map((f) => `${f.source}-${f.id}`)).size).toBe(shown.length);
  });

  test('одинаковый id из разных источников — разные строки', () => {
    expect(
      uniqueFeatures([
        { id: 'x', source: 'class' },
        { id: 'x', source: 'feat' },
        { id: 'x', source: 'class' },
      ]),
    ).toEqual([
      { id: 'x', source: 'class' },
      { id: 'x', source: 'feat' },
    ]);
  });
});
