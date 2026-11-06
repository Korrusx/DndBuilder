// Счётчик и готовность экрана «Новое на N-м уровне» (design/level-up/deck-screen-spec.md, разделы 3 и 7).

import { t } from '@/shared/i18n';

import type { Deck, DeckProgress, LevelUpCard } from '../model/types';

type HintKey = 'Hp' | 'HpOpen' | 'HpChoose' | 'HpOpenChoose' | 'Open' | 'Choose' | 'OpenChoose';

/**
 * Выбор на карте закрыт: обязательный — сделан; необязательный («Заменить одно заклинание») — игрок что-то
 * выбрал или нажал «Не менять». `settled` — id необязательных выборов, которые игрок так закрыл.
 */
export function isChoiceSettled(card: LevelUpCard, settled: string[]): boolean {
  const choice = card.choice;
  if (!choice) {
    return true;
  }
  return choice.required ? choice.done : choice.picked > 0 || settled.includes(choice.id);
}

/**
 * Первая карта, которую надо открыть или в которой надо сделать выбор; хиты, пока не брошены, — первыми.
 * `null` — всё готово.
 */
export function firstPendingCard(deck: Deck, settled: string[], hpDecided = true): string | null {
  return (
    deck.cards.find(
      (card) =>
        (card.type === 'hp' && !hpDecided) ||
        (card.type !== 'hp' && (card.state === 'hidden' || !isChoiceSettled(card, settled))),
    )?.id ?? null
  );
}

/** `hpDecided` — хиты уровня брошены (или взято среднее, введён свой кубик): без этого «Дальше» неактивна. */
export function deckProgress(deck: Deck, settled: string[], hpDecided = true): DeckProgress {
  const total = deck.cards.length;
  // Карта хитов не прячется под рубашку: она открыта, но может быть ещё не брошена.
  const hidden = deck.cards.filter((card) => card.state === 'hidden' && card.type !== 'hp').length;
  const withChoice = deck.cards.filter((card) => card.choice);
  const choicesLeft = withChoice.filter((card) => !isChoiceSettled(card, settled)).length;
  const ready = hidden === 0 && choicesLeft === 0 && hpDecided;
  const cards = t('levelUpDeck.screen.cards', { count: hidden });
  const choices = t('levelUpDeck.screen.choices', { count: choicesLeft });
  const key = `${hpDecided ? '' : 'Hp'}${hidden ? 'Open' : ''}${choicesLeft ? 'Choose' : ''}`;
  const hint = ready
    ? t('levelUpDeck.screen.ready')
    : t(`levelUpDeck.screen.hint.${key as HintKey}`, { cards, choices });
  return {
    hpDecided,
    revealed: total - hidden,
    total,
    choicesDone: withChoice.length - choicesLeft,
    choicesTotal: withChoice.length,
    choicesRequired: withChoice.filter((card) => card.choice?.required).length,
    ready,
    hint,
  };
}
