import type { Character } from '@/entities/character';
import { computeSheet, totalLevel } from '@/entities/character';
import { content } from '@/shared/content';

import { hpGain } from '../deck/hpGain';
import { levelUpDeck } from '../deck/levelUpDeck';
import { irmaAt } from '../deck/__tests__/fixtures';
import {
  activePending,
  applyLevelUp,
  beginLevelUp,
  canUndoLevelUp,
  pendingDraft,
  revealCards,
  setPendingHp,
  storeDraft,
  undoLevelUp,
} from '../pending';

const NOW = '2026-11-06T10:00:00.000Z';
const begin = (c: Character, classId = c.classes[0].classId): Character => ({
  ...c,
  pendingLevelUp: beginLevelUp(c, classId, NOW),
});
/** Сохранить и снова прочитать персонажа, как после перезапуска приложения. */
const reload = (c: Character): Character => JSON.parse(JSON.stringify(c)) as Character;

describe('отложенное повышение', () => {
  test('бросок хитов закреплён: после «перезапуска» тот же результат, переброса и «среднего» нет', () => {
    let irma = setPendingHp(begin(irmaAt(5)), { method: 'roll', value: 2 }, false);
    irma = reload(irma);
    expect(activePending(irma)?.hp).toEqual({ method: 'roll', value: 2 });
    expect(setPendingHp(irma, { method: 'roll', value: 8 }, false)).toBe(irma);
    expect(setPendingHp(irma, { method: 'average', value: 5 }, false)).toBe(irma);
    // С настройкой «Разрешить переброс хитов» — можно.
    expect(activePending(setPendingHp(irma, { method: 'roll', value: 8 }, true))?.hp?.value).toBe(8);
    // Среднее можно сменить броском.
    const avg = setPendingHp(begin(irmaAt(5)), { method: 'average', value: 5 }, false);
    expect(activePending(setPendingHp(avg, { method: 'roll', value: 1 }, false))?.hp?.method).toBe('roll');
  });

  test('выборы копятся в отложенном повышении и переживают перезапуск', () => {
    const prev = irmaAt(5);
    let irma = begin({ ...prev, expertise: ['stealth', 'sleight-of-hand'] });
    const draft = pendingDraft(irma)!;
    irma = reload(storeDraft(irma, { ...draft, expertise: [...draft.expertise, 'perception', 'acrobatics'] }));
    irma = revealCards(irma, ['hp', 'choice.expertise']);
    expect(pendingDraft(irma)?.expertise).toEqual(['stealth', 'sleight-of-hand', 'perception', 'acrobatics']);
    expect(activePending(irma)?.revealed).toEqual(['hp', 'choice.expertise']);
    // Сам персонаж пока не изменился.
    expect(totalLevel(irma.classes)).toBe(5);
  });

  test('применение: одна запись, бросок в хитах листа, способ запоминается', () => {
    const prev = irmaAt(5);
    const irma = setPendingHp(begin(prev), { method: 'roll', value: 3 }, false);
    const deck = levelUpDeck(prev, pendingDraft(irma)!, content, { hp: activePending(irma)!.hp });
    const done = applyLevelUp(irma, content);
    expect(totalLevel(done.classes)).toBe(6);
    expect(done.pendingLevelUp).toBeUndefined();
    expect(done.hpMethod).toBe('roll');
    expect(done.hpRolls).toEqual({ 'rogue.6': 3 });
    const gain = computeSheet(done, content).maxHp - computeSheet(prev, content).maxHp;
    expect(gain).toBe(3 + 2);
    expect(deck.cards[0].hp?.gain).toBe(gain);
  });

  test('«Отменить последнее повышение» возвращает персонажа в точности как до повышения', () => {
    const before = { ...irmaAt(5), hpMethod: 'average' as const };
    const done = applyLevelUp(setPendingHp(begin(before), { method: 'roll', value: 7 }, false), content);
    expect(canUndoLevelUp(done)).toBe(true);
    expect(undoLevelUp(done)).toEqual(before);
  });

  test('два уровня подряд: две колоды по очереди, отменить можно только последнее', () => {
    const five = irmaAt(5);
    const six = applyLevelUp(begin({ ...five, expertise: [...five.expertise] }), content);
    // Колода 6 → 7 строится от уже применённого 6-го уровня.
    const draft = pendingDraft(begin(six))!;
    expect(levelUpDeck(six, draft, content).cards.map((c) => c.id)).toContain('feature.rogue-evasion');
    const seven = applyLevelUp(begin(six), content);
    expect(totalLevel(seven.classes)).toBe(7);
    expect(totalLevel(undoLevelUp(seven).classes)).toBe(6);
    // После следующего повышения старый снимок недоступен: в снимке 6-го уровня нет своего снимка.
    expect(undoLevelUp(seven).levelUpUndo).toBeUndefined();
  });

  test('отложенное повышение другого уровня (персонаж изменился) не используется', () => {
    const stale = { ...irmaAt(6), pendingLevelUp: beginLevelUp(irmaAt(5), 'rogue', NOW) };
    expect(activePending(stale)).toBeUndefined();
    expect(applyLevelUp(stale, content)).toBe(stale);
  });
});

describe('минимум 1 хит за уровень', () => {
  test('бросок 1 при ТЕЛ −3: +1 с добавкой в разборе', () => {
    const result = hpGain({
      die: 6,
      method: 'roll',
      rolled: 1,
      conMod: -3,
      perLevelBonuses: [],
      retroactiveConDelta: 0,
      levelsBefore: 3,
    });
    expect(result.gain).toBe(1);
    expect(result.breakdown).toContainEqual({ kind: 'minimum', value: 3 });
  });
});
