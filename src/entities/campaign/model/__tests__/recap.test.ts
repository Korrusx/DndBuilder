import { buildRecap, lastEndedSession, recapToText } from '../recap';
import type { ChronicleEvent } from '../types';
import { entity, event, m, note, session } from './fixtures';

const boris = entity('boris', 'Борис');
const mara = entity('mara', 'Мара');
const orso = entity('orso', 'Капитан Орсо');
const anchor = entity('anchor', 'Пьяный якорь', 'place');
const cellar = entity('cellar', 'Что в подвале таверны', 'quest');
const debt = entity('debt', 'Долг «Тихим рукам»', 'quest', { personal: true });
const entities = [boris, mara, orso, anchor, cellar, debt];

const s10 = session(10, '2026-10-15T18:00:00.000Z');
const at = (time: string) => `2026-10-22T${time}:00.000Z`;
const key: ChronicleEvent = {
  type: 'loot',
  direction: 'gain',
  items: [{ itemId: 'custom-key', name: 'ключ с якорем', quantity: 1 }],
  coins: {},
};

function session11(whereWeStopped?: string) {
  const s11 = session(11, at('18:00'), { whereWeStopped, endedAt: at('23:00') });
  const entries = [
    note('s10', '2026-10-15T19:00:00.000Z', `Сняли комнаты у ${m(boris)}`),
    note('s11', at('18:30'), `Отряд прибыл в ${m(anchor)}, ${m(boris)} снова нам рад.`),
    note('s11', at('19:00'), `Стражница ${m(mara)} попросила выяснить, что Борис прячет в подвале.`, {
      tags: ['clue'],
    }),
    note('s11', at('20:00'), `${m(orso)} — тайный информатор «Тихих рук».`, { secret: true }),
    event('s11', at('21:00'), key),
    event('s11', at('21:01'), { type: 'loot', direction: 'gain', items: [], coins: { gp: 45 } }),
    event('s11', at('21:02'), { type: 'natural', natural: 20, roll: 'Ловкость рук' }),
    note('s11', at('22:00'), `Ночная драка; ${m(orso)} помог отбиться.`, { tags: ['combat'] }),
  ];
  return { s11, entries };
}

describe('«В прошлый раз…»', () => {
  test('сессия 11: три заметки без тайной, Мара и Орсо впервые, «Где остановились» из поля', () => {
    const { s11, entries } = session11('У двери в подвал, с чужим ключом в руке.');
    const recap = buildRecap(s11, entries, [s10, s11], entities);
    expect(recap.happened).toEqual([
      'Отряд прибыл в Пьяный якорь, Борис снова нам рад.',
      'Стражница Мара попросила выяснить, что Борис прячет в подвале.',
      'Ночная драка; Капитан Орсо помог отбиться.',
    ]);
    expect(recap.happened.join(' ')).not.toContain('тайный');
    expect(recap.met.map((person) => person.name)).toEqual(['Мара', 'Капитан Орсо', 'Борис']);
    expect(recap.found).toEqual(['Найдено: ключ с якорем, 45 зм']);
    expect(recap.whereWeStopped).toBe('У двери в подвал, с чужим ключом в руке.');
    expect(recap.openQuests.map(({ quest }) => quest.id)).toEqual(['debt', 'cellar']);
  });

  test('без поля «Где остановились» — последняя заметка (и её нет в «Что произошло»)', () => {
    const { s11, entries } = session11('  ');
    const recap = buildRecap(s11, entries, [s10, s11], entities);
    expect(recap.whereWeStopped).toBe('Ночная драка; Капитан Орсо помог отбиться.');
    expect(recap.happened).toHaveLength(2);
  });

  test('больше 5 заметок: сначала подсказки и бой, затем последние, по порядку времени', () => {
    const s11 = session(11, at('18:00'), { whereWeStopped: 'Тут' });
    const entries = ['1', '2', '3', '4', '5', '6', '7'].map((text, i) =>
      note('s11', at(`1${i}:00`), text, { tags: text === '1' ? ['clue'] : text === '2' ? ['combat'] : [] }),
    );
    expect(buildRecap(s11, entries, [s11], entities).happened).toEqual(['1', '2', '5', '6', '7']);
  });
});

describe('«В прошлый раз…» текстом для «Поделиться»', () => {
  test('без тайной записи, с квестами и «Где остановились»', () => {
    const { s11, entries } = session11('У двери в подвал.');
    const recap = buildRecap(
      s11,
      entries,
      [s10, s11],
      entities,
      [],
      [{ questId: 'debt', current: 180, target: 500, unit: 'gp', linkedToWallet: true, updatedAt: at('18:00') }],
    );
    const text = recapToText(recap, 'Тени Солёной Гавани');
    expect(text).toContain('Тени Солёной Гавани — сессия 11, 22 октября');
    expect(text).toContain('Стражница Мара попросила выяснить');
    expect(text).toContain('◆ Долг «Тихим рукам» · 320 зм');
    expect(text).toContain('Где остановились: У двери в подвал.');
    expect(text).not.toContain('тайный');
  });

  test('последняя завершённая сессия', () => {
    const ended = session(11, at('18:00'), { endedAt: at('23:00') });
    const live = session(12, '2026-10-29T18:00:00.000Z');
    expect(lastEndedSession([live, ended, s10])).toBe(ended);
    expect(lastEndedSession([live])).toBeNull();
  });
});
