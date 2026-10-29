import {
  activeSessionOf,
  firstLine,
  hallOfHeroes,
  isForgottenSession,
  nextSessionNumber,
  searchEntries,
  timelineGroups,
} from '../timeline';
import type { CampaignCharacter } from '../types';
import { byId, entity, event, m, note, session } from './fixtures';

const s11 = session(11, '2026-10-22T18:00:00.000Z', { endedAt: '2026-10-22T23:00:00.000Z' });
const s12 = session(12, '2026-10-29T19:05:00.000Z');
const boris = entity('boris', 'Борис');

describe('летопись по блокам', () => {
  test('сессии от новой к старой, «между сессиями» — над сессией, после которой записаны', () => {
    const entries = [
      note('s11', '2026-10-22T19:00:00.000Z', 'Прибыли в Гавань, встретили Мару'),
      event(null, '2026-10-25T12:00:00.000Z', { type: 'rest', rest: 'long' }),
      note('s12', '2026-10-29T19:20:00.000Z', `Хозяин таверны ${m(boris)} врёт`),
      event('s12', '2026-10-29T19:48:00.000Z', { type: 'natural', natural: 20, roll: 'Ловкость рук' }),
    ];
    const groups = timelineGroups([s11, s12], entries);
    expect(groups.map((group) => group.key)).toEqual(['s12', 'between-s11', 's11']);
    expect(groups[0]).toMatchObject({ noteCount: 1, entryCount: 2 });
    expect(firstLine(groups[0], byId([boris]))).toBe('Хозяин таверны Борис врёт');
    expect(firstLine(groups[2], new Map())).toBe('Прибыли в Гавань, встретили Мару');
  });

  test('записи до первой сессии — в самом низу', () => {
    const groups = timelineGroups([s12], [note(null, '2026-10-01T00:00:00.000Z', 'Завязка')]);
    expect(groups.map((group) => group.key)).toEqual(['s12', 'between-start']);
  });

  test('номер новой сессии и идущая сессия', () => {
    expect(nextSessionNumber([])).toBe(1);
    expect(nextSessionNumber([s11, s12])).toBe(13);
    expect(activeSessionOf([s11, s12])).toBe(s12);
    expect(activeSessionOf([s11])).toBeNull();
  });

  test('сессия без событий больше 12 часов — забыли завершить', () => {
    const entries = [note('s12', '2026-10-29T23:00:00.000Z', 'Последняя запись')];
    expect(isForgottenSession(s12, entries, '2026-10-30T10:00:00.000Z')).toBe(false);
    expect(isForgottenSession(s12, entries, '2026-10-30T11:30:00.000Z')).toBe(true);
    expect(isForgottenSession(s11, [], '2027-01-01T00:00:00.000Z')).toBe(false);
  });

  test('поиск по заметкам с текущими именами и по автособытиям', () => {
    const entries = [
      note('s12', '2026-10-29T19:20:00.000Z', `${m(boris)} врёт про подвал`),
      event('s12', '2026-10-29T19:48:00.000Z', { type: 'natural', natural: 20, roll: 'Ловкость рук' }),
    ];
    const renamed = byId([{ ...boris, name: 'Борис Кружка' }]);
    expect(searchEntries('кружка', entries, renamed)).toEqual([entries[0]]);
    expect(searchEntries('ловкость', entries, renamed)).toEqual([entries[1]]);
    expect(searchEntries(' ', entries, renamed)).toEqual([]);
  });

  test('«Зал героев»: Ирма пала, новый герой продолжает', () => {
    const participants: CampaignCharacter[] = [
      {
        campaignId: 'shadows',
        characterId: 'irma',
        status: 'fallen',
        joinedAt: '2026-01-01',
        leftAt: '2026-10-29',
        epitaph: 'Ушла в тень с чужим ключом',
        updatedAt: '2026-10-29',
      },
      { campaignId: 'shadows', characterId: 'tom', status: 'active', joinedAt: '2026-10-29', updatedAt: '2026-10-29' },
    ];
    expect(hallOfHeroes(participants).map((hero) => hero.characterId)).toEqual(['irma']);
  });
});
