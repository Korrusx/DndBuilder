import { computeSheet } from '@/entities/character';
import { content } from '@/shared/content';

import { levelUpDeck } from '../../model/deck/levelUpDeck';
import { nextLevelPreview } from '../../model/deck/previews';
import { startLevelUp } from '../../model/levelup';
import { irmaAt, irmaCon14At7, liraAt4 } from '../../model/deck/__tests__/fixtures';
import { cardTitle, choiceTitle, hpBreakdownText, needFirstText, nextLevelText, rowText, tagText } from '../cardText';

describe('тексты карт (русский)', () => {
  test('Ирма 4 → 5: рост, метка реакции, разбор хитов', () => {
    const prev = irmaAt(4);
    const deck = levelUpDeck(prev, startLevelUp(prev), content);
    const growth = deck.cards.find((c) => c.type === 'growth')!;
    const sneak = growth.rows!.find((r) => r.label.kind === 'column')!;
    expect(rowText(sneak)).toBe('Скрытая атака 2к6 → 3к6');
    const pb = growth.rows!.find((r) => r.label.kind === 'number' && r.label.key === 'profBonus')!;
    expect(rowText(pb)).toBe('Бонус мастерства +2 → +3');
    const attacks = computeSheet(prev, content).attacks;
    const shortsword = pb.details!.find((r) => r.label.kind === 'number' && r.label.ref === 'shortsword')!;
    expect(rowText(shortsword, { attacks })).toBe('Короткий меч: атака +6 → +7');
    const dodge = deck.cards.find((c) => c.id === 'feature.rogue-uncanny-dodge')!;
    expect(cardTitle(dodge)).toBe('Невероятное уклонение');
    expect(tagText(dodge.tags![0])).toBe('реакция');
    expect(hpBreakdownText(deck.cards[0].hp!.breakdown)).toBe('5 в среднем + 2 (ТЕЛ)');
  });

  test('5 → 6: подпись блокировки, счётчики, «На следующем уровне»', () => {
    const prev = { ...irmaAt(5), expertise: ['stealth', 'sleight-of-hand'] };
    const deck = levelUpDeck(prev, startLevelUp(prev), content);
    expect(choiceTitle(deck.blockers[0])).toBe('Компетентность');
    expect(needFirstText(deck.blockers[0])).toBe('Сначала выберите навыки');
    expect(nextLevelText(nextLevelPreview(irmaAt(6), content))).toBe(
      'Увёртливость, Надёжный талант, скрытая атака 4к6',
    );
  });

  test('пересчёт ТЕЛ за прошлые уровни и заряды умения', () => {
    const prev = irmaCon14At7();
    const next = {
      ...startLevelUp(prev),
      feats: [
        ...prev.feats,
        { featId: 'ability-score-improvement', source: 'class' as const, level: 8, abilityIncreases: { con: 2 } },
      ],
    };
    const hp = levelUpDeck(prev, next, content).cards[0].hp!;
    expect(hpBreakdownText(hp.breakdown)).toBe('5 в среднем + 3 (ТЕЛ) + 7 за прошлые уровни (+1 × 7)');
    expect(tagText({ kind: 'uses', max: 1, recovery: 'long' })).toBe('1 раз · долгий отдых');
    expect(tagText({ kind: 'uses', max: 3, recovery: 'short' })).toBe('3 раза · короткий отдых');
  });

  test('Лира 4 → 5: карта магии «Открыт 3-й круг»', () => {
    const prev = liraAt4();
    const magic = levelUpDeck(prev, startLevelUp(prev), content).cards.find((c) => c.type === 'magic')!;
    expect(cardTitle(magic)).toBe('Открыт 3-й круг');
  });
});
