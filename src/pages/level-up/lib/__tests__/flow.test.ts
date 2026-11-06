// Поток «Ритуал → Колода»: с какого шага продолжить, смена класса, хиты в колоде.

import type { Character, PendingLevelUp } from '@/entities/character';
import { averageHitDie } from '@/entities/character';
import {
  activePending,
  beginLevelUp,
  deckProgress,
  levelUpBase,
  levelUpDeck,
  pendingDraft,
  setPendingHp,
} from '@/features/level-up';
import { irmaAt } from '@/features/level-up/model/deck/__tests__/fixtures';
import { content } from '@/shared/content';

import { DECK_OPENED, resumeStage, ritualSubtitle } from '../deckScreen';
import { manualHp } from '../useHpRoll';

// Модуль повышения тянет анимации и 3D-стол — в тесте логики они не нужны.
jest.mock('react-native-worklets', () => ({ scheduleOnRN: (fn: () => void) => fn() }));
jest.mock('react-native-reanimated', () => {
  const chain: object = new Proxy(() => chain, { get: () => chain, apply: () => chain });
  return new Proxy({ __esModule: true }, { get: (target, key) => (key in target ? target[key as never] : chain) });
});
jest.mock('@shopify/react-native-skia', () => new Proxy({}, { get: () => () => null }));
jest.mock('expo-sensors', () => ({ Accelerometer: { setUpdateInterval: jest.fn(), addListener: jest.fn() } }));
jest.mock('expo-audio', () => ({ createAudioPlayer: jest.fn(), setAudioModeAsync: jest.fn() }));
jest.mock('@/features/roll-dice', () => ({ useDiceSettings: jest.fn(), DiceTable: () => null }));

const pendingOf = (extra: Partial<PendingLevelUp>): PendingLevelUp => ({
  ...beginLevelUp(irmaAt(5), 'rogue', 'now'),
  ...extra,
});

describe('с какого шага открыть повышение', () => {
  test('новое — ритуал; колода уже открывалась или хиты брошены — сразу колода, без ритуала и звука', () => {
    expect(resumeStage(pendingOf({}))).toBe('start');
    expect(resumeStage(pendingOf({ revealed: [DECK_OPENED, 'hp'] }))).toBe('cards');
    expect(resumeStage(pendingOf({ hp: { method: 'roll', value: 4 } }))).toBe('cards');
  });
});

describe('мультикласс на ритуале', () => {
  test('выбор другого класса пересобирает колоду и меняет подзаголовок', () => {
    const irma = irmaAt(5);
    const rogue: Character = { ...irma, pendingLevelUp: beginLevelUp(irma, 'rogue', 'now') };
    const wizard: Character = { ...irma, pendingLevelUp: beginLevelUp(irma, 'wizard', 'now') };
    const deckOf = (c: Character) => levelUpDeck(levelUpBase(c) as Character, pendingDraft(c)!, content);
    expect(ritualSubtitle(irma, pendingDraft(rogue)!, 'rogue')).toBe('Плут 5 → 6 · Вор');
    expect(ritualSubtitle(irma, pendingDraft(wizard)!, 'wizard')).toBe('Волшебник 1');
    expect(deckOf(rogue).cards.map((card) => card.id)).toContain('choice.expertise');
    expect(deckOf(wizard).cards.some((card) => card.type === 'multiclass')).toBe(true);
  });
});

describe('хиты в колоде', () => {
  test('среднее для к8 — 5; свой кубик — только от 1 до 8', () => {
    expect(averageHitDie(8)).toBe(5);
    expect(manualHp(6, 8)).toEqual({ method: 'manual', value: 6 });
    expect([0, 9, 2.5, -1].map((value) => manualHp(value, 8))).toEqual([null, null, null, null]);
  });

  test('бросок: «Дальше» становится доступной, результат переживает перезапуск', () => {
    const irma = irmaAt(5);
    const started: Character = {
      ...irma,
      pendingLevelUp: { ...beginLevelUp(irma, 'rogue', 'now'), revealed: [DECK_OPENED, 'hp', 'choice.expertise'] },
    };
    const rolled = setPendingHp(started, { method: 'roll', value: 6 }, false);
    // «Перезапуск»: персонаж сохранён в базу и прочитан обратно.
    const restored = JSON.parse(JSON.stringify(rolled)) as Character;
    const pending = activePending(restored)!;
    expect(pending.hp).toEqual({ method: 'roll', value: 6 });
    const deck = levelUpDeck(levelUpBase(restored) as Character, pendingDraft(restored)!, content, {
      hp: pending.hp,
      revealed: pending.revealed,
    });
    const hp = deck.cards[0].hp!;
    expect(deck.cards[0].type).toBe('hp');
    // Ирма: ТЕЛ 15 (+2) — 6 на кубике + 2.
    expect(hp.gain).toBe(8);
    expect(hp.maxAfter).toBe(hp.maxBefore + 8);
    expect(deckProgress(deck, [], false).ready).toBe(false);
    expect(deckProgress(deck, [], true).hint).toBe('Осталось сделать 1 выбор');
    // Брошенное закреплено, пока переброс не разрешён.
    expect(activePending(setPendingHp(rolled, { method: 'average', value: 5 }, false))?.hp?.value).toBe(6);
  });
});
