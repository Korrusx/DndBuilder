import type { Coin } from '@/shared/content';

/** Группы автособытий для переключателей в «О приложении → Хроника». */
export type JournalGroup = 'rolls' | 'health' | 'level' | 'loot' | 'rest' | 'combat' | 'chronicle';

/** Настройки журнала: какие группы не записывать (по умолчанию записывается всё). */
export type JournalSettings = { disabled: JournalGroup[] };

/** Куда писать событие: кампания и идущая сессия (null — «между сессиями»). */
export type JournalTarget = { campaignId: string; sessionId: string | null };

/** Сумма монет со знаком: + получено, − потрачено. */
export type CoinBalance = Partial<Record<Coin, number>>;

/** Куда сейчас идут события героя — показывается под кнопкой кампании на «Листе». */
export type JournalState =
  | { kind: 'none' }
  | { kind: 'hall'; campaignId: string }
  | { kind: 'session'; campaignId: string; number: number }
  | { kind: 'between'; campaignId: string };
