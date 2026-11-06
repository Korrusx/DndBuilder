// Вспомогательное для экранов колоды: подписи рубашек, блок «Без изменений», стартовый шаг.

import type { Character, PendingLevelUp } from '@/entities/character';
import type { Deck, LevelSnapshot, LevelUpCard, TextContext } from '@/features/level-up';
import { cardShortTitle, rowLabel, rowValue } from '@/features/level-up';
import { byId, localizeText, nameOf } from '@/shared/content';
import { t } from '@/shared/i18n';
import { formatModifier } from '@/shared/lib/dice';

export type DeckStage = 'start' | 'hp' | 'cards' | 'done';

/** Подпись рубашки на У1: тип карты; карта-выбор от нового умения — «Умение». */
export function backLabel(card: LevelUpCard): string {
  if (card.type === 'choice' && card.ref?.table === 'features') {
    return t('levelUpDeck.type.feature');
  }
  if (card.type === 'feature' || card.type === 'capstone') {
    return cardShortTitle(card);
  }
  return t(`levelUpDeck.type.${card.type}`);
}

/** С какого шага продолжить отложенное повышение. */
export function resumeStage(pending: PendingLevelUp): DeckStage {
  if (pending.revealed.length > 1) {
    return 'cards';
  }
  return pending.hp ? 'cards' : 'start';
}

/** Первая неоткрытая карта (иначе первая после хитов). */
export function firstOpenIndex(deck: Deck): number {
  const hidden = deck.cards.findIndex((card) => card.state === 'hidden');
  return hidden >= 0 ? hidden : Math.min(1, deck.cards.length - 1);
}

/** Блок «Без изменений»: бонус мастерства и кубики умений, которые не выросли. */
export function unchangedText(deck: Deck, after: LevelSnapshot, context: TextContext): string {
  const parts: string[] = [];
  if (deck.unchanged.includes('profBonus')) {
    parts.push(t('levelUpDeck.unchangedProfBonus', { value: formatModifier(after.sheet.profBonus) }));
  }
  if (deck.unchanged.includes('dice')) {
    const dice = Object.entries(after.columns).flatMap(([classId, table]) =>
      Object.entries(table)
        .filter(([, value]) => typeof value === 'string')
        .map(([column, value]) => {
          const label = { kind: 'column' as const, classId, column };
          return `${rowLabel(label, context)} ${rowValue(label, value)}`;
        }),
    );
    parts.push(...(dice.length ? dice : [t('levelUpDeck.unchangedDice')]));
  }
  return parts.join(' · ');
}

/** «Плут · Вор» — класс и подкласс уровня для У1. */
export function classLine(character: Character, classId: string): string {
  const entry = character.classes.find((e) => e.classId === classId);
  const subclass = entry?.subclassId ? localizeText(byId.subclasses.get(entry.subclassId)?.name).text : '';
  return [nameOf('classes', classId), subclass].filter(Boolean).join(' · ');
}
