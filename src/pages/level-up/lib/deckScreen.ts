// Вспомогательное для экранов колоды: подписи рубашек, подзаголовки, стартовый шаг.

import type { Character, PendingLevelUp } from '@/entities/character';
import type { Deck, LevelSnapshot, LevelUpCard, TextContext } from '@/features/level-up';
import { cardShortTitle, lowerFirst, rowLabel, rowValue } from '@/features/level-up';
import { byId, localizeText, nameOf } from '@/shared/content';
import { t } from '@/shared/i18n';
import { formatModifier } from '@/shared/lib/dice';

export type DeckStage = 'start' | 'cards' | 'done';

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

/** Метка в `PendingLevelUp.revealed`: колода уже открыта — продолжение сразу в неё, без ритуала. */
export const DECK_OPENED = 'deck:opened';

/** С какого шага продолжить отложенное повышение: колода уже открывалась — сразу в неё, без ритуала и звука. */
export function resumeStage(pending: PendingLevelUp): DeckStage {
  return pending.hp || pending.revealed.length > 0 ? 'cards' : 'start';
}

/** Подзаголовок экрана карт: «Каэлан · паладин · драконорождённый». */
export function deckSubtitle(name: string, character: Character, classId: string): string {
  return t('levelUpDeck.screen.subtitle', {
    name,
    className: lowerFirst(nameOf('classes', classId)),
    species: lowerFirst(nameOf('species', character.speciesId)),
  });
}

/** Подзаголовок ритуала: «Паладин 5 → 6 · Клятва преданности»; новый класс — «Волшебник 1». */
export function ritualSubtitle(prev: Character, next: Character, classId: string): string {
  const entry = next.classes.find((e) => e.classId === classId);
  const before = prev.classes.find((e) => e.classId === classId);
  const name = nameOf('classes', classId);
  if (!entry || !before) {
    return t('levelUpDeck.classLevel', { className: name, level: entry?.level ?? 1 });
  }
  const subclass = entry.subclassId ? localizeText(byId.subclasses.get(entry.subclassId)?.name).text : '';
  return [`${name} ${before.level} → ${entry.level}`, subclass].filter(Boolean).join(' · ');
}

/** «Без изменений на этом уровне»: бонус мастерства и главные кубики класса, которые не выросли. */
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
          return `${lowerFirst(rowLabel(label, context))} ${rowValue(label, value)}`;
        }),
    );
    parts.push(...(dice.length ? dice : [t('levelUpDeck.unchangedDice')]));
  }
  return parts.map(lowerFirst).join(', ');
}
