// Автособытия летописи: хранение в записи, склейка однотипных подряд, текст на текущем языке.

import type { Coin } from '@/shared/content';
import { coinAbbr, COIN_ORDER, coinsText, itemName, nameOf } from '@/shared/content';
import { t } from '@/shared/i18n';

import { COALESCE_WINDOW_MS, COALESCED_EVENTS } from '../config/constants';
import type { Coins, LootItem } from '@/shared/lib/play-events';

import type { ChronicleEvent, Entity, Entry, TimelineItem } from './types';

/** Автособытие из записи летописи (или null, если это заметка или событие неизвестного вида). */
export function entryEvent(entry: Entry): ChronicleEvent | null {
  if (entry.kind !== 'event' || !entry.eventType) {
    return null;
  }
  return { ...(entry.eventData ?? {}), type: entry.eventType } as ChronicleEvent;
}

/** Поля записи летописи для автособытия. */
export function eventEntryFields(event: ChronicleEvent): Pick<Entry, 'kind' | 'eventType' | 'eventData'> {
  const { type, ...data } = event;
  return { kind: 'event', eventType: type, eventData: data };
}

const time = (iso: string) => new Date(iso).getTime();

function addCoins(a: Coins, b: Coins): Coins {
  const sum: Coins = {};
  for (const coin of COIN_ORDER) {
    const value = (a[coin] ?? 0) + (b[coin] ?? 0);
    if (value) {
      sum[coin] = value;
    }
  }
  return sum;
}

function addItems(a: LootItem[], b: LootItem[]): LootItem[] {
  const result = a.map((item) => ({ ...item }));
  for (const item of b) {
    const same = result.find((other) => other.itemId === item.itemId && other.name === item.name);
    if (same) {
      same.quantity += item.quantity;
    } else {
      result.push({ ...item });
    }
  }
  return result;
}

/** Можно ли приклеить событие `next` к уже собранному `item`. */
function canMerge(item: TimelineItem, next: ChronicleEvent, entry: Entry): boolean {
  if (item.kind !== 'event' || item.sessionId !== entry.sessionId || item.event.type !== next.type) {
    return false;
  }
  if (!COALESCED_EVENTS.has(next.type)) {
    return false;
  }
  if (item.event.type === 'loot' && next.type === 'loot' && item.event.direction !== next.direction) {
    return false;
  }
  const last = item.entries[item.entries.length - 1];
  return time(entry.createdAt) - time(last.createdAt) <= COALESCE_WINDOW_MS;
}

function merge(a: ChronicleEvent, b: ChronicleEvent): ChronicleEvent {
  if (a.type === 'loot' && b.type === 'loot') {
    return { ...a, items: addItems(a.items, b.items), coins: addCoins(a.coins, b.coins) };
  }
  return a;
}

/**
 * Летопись по порядку времени: заметки как есть, однотипные автособытия подряд в одной сессии склеены
 * (несколько монет → «Получено 55 зм», находки за 2 минуты → «Найдено: ключ, 45 зм»).
 * Натуральные 20 и 1, уровни, 0 хитов не склеиваются. Заметка между событиями разрывает склейку.
 */
export function coalesceEvents(entries: Entry[]): TimelineItem[] {
  const items: TimelineItem[] = [];
  const sorted = [...entries].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  for (const entry of sorted) {
    const event = entryEvent(entry);
    if (!event) {
      if (entry.kind === 'note') {
        items.push({ kind: 'note', entry });
      }
      continue;
    }
    const last = items[items.length - 1];
    if (last && last.kind === 'event' && canMerge(last, event, entry)) {
      last.event = merge(last.event, event);
      last.entries.push(entry);
    } else {
      items.push({ kind: 'event', event, entries: [entry], at: entry.createdAt, sessionId: entry.sessionId });
    }
  }
  return items;
}

/** Сумма в единицах счётчика квеста: «50 зм» или «3 головы». */
export function amountText(amount: number, unit: string): string {
  return COIN_ORDER.includes(unit as Coin) ? `${amount} ${coinAbbr(unit as Coin)}` : `${amount} ${unit}`.trim();
}

const lootItemText = (item: LootItem) => (item.quantity > 1 ? `${itemName(item)} ×${item.quantity}` : itemName(item));

/** Текущее имя карточки (если её переименовали) или имя на момент события. */
const currentName = (id: string, fallback: string, entitiesById?: ReadonlyMap<string, Entity>) =>
  entitiesById?.get(id)?.name ?? fallback;

/** Текст автособытия на текущем языке приложения. */
export function eventText(event: ChronicleEvent, entitiesById?: ReadonlyMap<string, Entity>): string {
  switch (event.type) {
    case 'sessionStart':
      return event.hp
        ? t('chronicle.event.sessionStartHp', { current: event.hp.current, max: event.hp.max })
        : t('chronicle.event.sessionStart');
    case 'natural':
      return t('chronicle.event.natural', { natural: event.natural, roll: event.roll });
    case 'down':
      return t('chronicle.event.down');
    case 'stabilized':
      return t('chronicle.event.stabilized');
    case 'died':
      return t('chronicle.event.died');
    case 'level':
      return event.classId
        ? t('chronicle.event.levelClass', {
            level: event.classLevel ?? event.level,
            className: nameOf('classes', event.classId),
          })
        : t('chronicle.event.level', { level: event.level });
    case 'loot': {
      const coins = coinsText(event.coins);
      if (event.items.length === 0) {
        return t(event.direction === 'gain' ? 'chronicle.event.coinsGained' : 'chronicle.event.coinsSpent', {
          coins,
        });
      }
      const list = event.items.map(lootItemText).join(', ');
      if (event.direction === 'gain') {
        return t('chronicle.event.found', { list: coins ? `${list}, ${coins}` : list });
      }
      const removed = t('chronicle.event.removed', { list });
      return coins ? `${removed} · ${t('chronicle.event.coinsSpent', { coins })}` : removed;
    }
    case 'rest':
      return t(event.rest === 'short' ? 'chronicle.event.shortRest' : 'chronicle.event.longRest');
    case 'combat':
      return t('chronicle.event.combat', { count: event.rounds, dealt: event.dealt, taken: event.taken });
    case 'quest':
      return t(`chronicle.event.quest.${event.change}`, {
        name: currentName(event.questId, event.name, entitiesById),
      });
    case 'person':
      return t('chronicle.event.person', { name: currentName(event.entityId, event.name, entitiesById) });
    case 'payment':
      return t('chronicle.event.payment', {
        amount: amountText(event.amount, event.unit),
        name: currentName(event.questId, event.name, entitiesById),
      });
  }
}
