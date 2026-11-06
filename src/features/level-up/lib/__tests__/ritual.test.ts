// Ритуал повышения уровня: строка «Вас ждут…» и кнопка мультикласса.

import type { Character } from '@/entities/character';
import { content } from '@/shared/content';

import { hero, irmaAt } from '../../model/deck/__tests__/fixtures';
import { levelUpDeck } from '../../model/deck/levelUpDeck';
import { multiclassAvailable, multiclassShortfall, startLevelUp } from '../../model/levelup';
import type { Deck, LevelUpCard } from '../../model/types';
import { ritualCountsText } from '../cardText';

const deckWith = (news: number, choices: number): Deck => ({
  cards: Array.from({ length: news }, (_, i): LevelUpCard => ({
    id: `c${i}`,
    type: i < choices ? 'choice' : 'feature',
    source: { kind: 'class' },
    state: 'hidden',
    ...(i < choices
      ? {
          choice: {
            id: `c${i}`,
            kind: 'skills',
            required: true,
            blocking: true,
            count: 1,
            picked: 0,
            done: false,
            source: 'class',
            classId: 'rogue',
            problems: [],
          },
        }
      : {}),
  })),
  blockers: [],
  counts: { news, choices },
  unchanged: [],
});

describe('ritualCountsText', () => {
  test('Ирма 5 → 6: хиты и компетентность', () => {
    const prev = irmaAt(5);
    expect(ritualCountsText(levelUpDeck(prev, startLevelUp(prev), content))).toBe('Вас ждут 2 новинки и 1 выбор');
  });

  test('без выборов и склонения', () => {
    expect(ritualCountsText(deckWith(3, 0))).toBe('Вас ждут 3 новинки');
    expect(ritualCountsText(deckWith(1, 0))).toBe('Вас ждёт 1 новинка');
    expect(ritualCountsText(deckWith(5, 0))).toBe('Вас ждут 5 новинок');
    expect(ritualCountsText(deckWith(5, 2))).toBe('Вас ждут 5 новинок и 2 выбора');
  });
});

describe('мультикласс', () => {
  test('сколько классов доступно и почему нельзя', () => {
    // Ирма: СИЛ 8, ЛОВ 17, ТЕЛ 14, ИНТ 14, МДР 12, ХАР 10.
    const irma: Character = irmaAt(5);
    expect(multiclassAvailable(irma, content)).toBeGreaterThan(0);
    expect(multiclassShortfall(irma, content, 'wizard')).toBe('');
    expect(multiclassShortfall(irma, content, 'cleric')).toBe('нужна МДР 13, у вас 12');
  });

  test('без подходящих классов — 0: нет 13 даже в своём классе', () => {
    const weak = hero('fighter', 3, { baseAbilities: { str: 12, dex: 12, con: 12, int: 12, wis: 12, cha: 12 } });
    expect(multiclassAvailable(weak, content)).toBe(0);
    expect(multiclassShortfall(weak, content, 'wizard')).toBe('нужна ИНТ 13, у вас 12');
  });
});
