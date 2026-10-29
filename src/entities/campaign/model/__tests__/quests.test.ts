import { contributeToCounter, questProgress, staleQuests } from '../quests';
import type { QuestCounter, QuestStep } from '../types';
import { entity, event, m, note, session } from './fixtures';

const step = (id: string, done: boolean, order: number): QuestStep => ({
  id,
  questId: 'cellar',
  text: id,
  done,
  order,
  updatedAt: '2026-09-01T10:00:00.000Z',
});

const debt: QuestCounter = {
  questId: 'debt',
  current: 180,
  target: 500,
  unit: 'gp',
  linkedToWallet: true,
  updatedAt: '2026-09-01T10:00:00.000Z',
};

describe('квесты', () => {
  test('«Что в подвале таверны»: 2 из 3, остался 1 шаг', () => {
    const progress = questProgress([step('a', true, 0), step('b', true, 1), step('c', false, 2)]);
    expect(progress).toEqual({ label: '2 из 3', remaining: '1 шаг остался', fraction: 2 / 3 });
  });

  test('личная линия «Долг "Тихим рукам"»: 180 из 500 зм, взнос 50 → 230 из 500 зм', () => {
    expect(questProgress([], debt)).toEqual({ label: '180 из 500 зм', remaining: '320 зм', fraction: 0.36 });
    const paid = contributeToCounter(debt, 50, '2026-10-29T20:00:00.000Z');
    expect(questProgress([], paid)?.label).toBe('230 из 500 зм');
    expect(paid.updatedAt).toBe('2026-10-29T20:00:00.000Z');
    expect(contributeToCounter(debt, -5, 'x')).toBe(debt);
    expect(contributeToCounter(debt, 0, 'x')).toBe(debt);
  });

  test('без шагов и счётчика — прогресса нет', () => {
    expect(questProgress([], null)).toBeNull();
  });

  test('квест без упоминаний с сессии 10 при текущей 12 → «не трогали с сессии 10»', () => {
    const sessions = [
      session(9, '2026-10-08T18:00:00.000Z'),
      session(10, '2026-10-15T18:00:00.000Z'),
      session(11, '2026-10-22T18:00:00.000Z'),
      session(12, '2026-10-29T18:00:00.000Z'),
    ];
    const fishermen = entity('fish', 'Пропавшие рыбаки', 'quest', { updatedAt: '2026-10-08T19:00:00.000Z' });
    const cellar = entity('cellar', 'Что в подвале таверны', 'quest', { updatedAt: '2026-10-08T19:00:00.000Z' });
    const done = entity('old', 'Старый квест', 'quest', { status: 'done', updatedAt: '2026-09-01T00:00:00.000Z' });
    const entries = [
      note('s10', '2026-10-15T19:00:00.000Z', `Орсо напомнил про ${m(fishermen)}`),
      note('s11', '2026-10-22T19:00:00.000Z', `Думаем про ${m(cellar)}`),
    ];
    expect(staleQuests([fishermen, cellar, done], entries, sessions, 12)).toEqual([
      { quest: fishermen, lastSessionNumber: 10 },
    ]);
    // Событие квеста в сессии 12 — уже не «давно».
    const reopened = event('s12', '2026-10-29T19:00:00.000Z', {
      type: 'quest',
      questId: 'fish',
      name: 'Пропавшие рыбаки',
      change: 'active',
    });
    const touched = [...entries, reopened];
    expect(staleQuests([fishermen], touched, sessions, 12)).toEqual([]);
  });
});
