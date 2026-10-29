// Журнал хроники: слушает события режима игры персонажа и пишет их в летопись его кампании.

import type { SQLiteDatabase } from 'expo-sqlite';

import type { ChronicleEvent } from '@/entities/campaign';
import { onPlayEvent } from '@/shared/lib/play-events';

import { COIN_QUIET_MS } from '../config/constants';
import { addToBalance, balanceEvents, isCoinsOnly } from '../model/coins';
import type { CoinBalance } from '../model/types';
import { recordEvent } from '@/entities/campaign/api';

/** Начать запись событий персонажа. Возвращает функцию остановки (накопленные монеты записываются сразу). */
export function startJournal(db: SQLiteDatabase, characterId: string, onError?: (error: unknown) => void) {
  let balance: CoinBalance = {};
  let timer: ReturnType<typeof setTimeout> | null = null;
  // Записи идут по очереди, чтобы порядок в летописи совпадал с порядком событий.
  let queue: Promise<unknown> = Promise.resolve();
  const write = (event: ChronicleEvent) => {
    queue = queue.then(() => recordEvent(db, event, { characterId })).catch((error) => onError?.(error));
  };
  const flushCoins = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    balanceEvents(balance).forEach(write);
    balance = {};
  };
  const off = onPlayEvent((message) => {
    if (message.characterId && message.characterId !== characterId) {
      return;
    }
    if (isCoinsOnly(message.event)) {
      balance = addToBalance(balance, message.event);
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(flushCoins, COIN_QUIET_MS);
      return;
    }
    write(message.event);
  });
  return {
    /** Записать накопленные монеты сейчас (игрок ушёл с экрана). */
    flush: flushCoins,
    /** Дождаться, пока все записи дойдут до базы. */
    idle: () => queue,
    stop: () => {
      off();
      flushCoins();
    },
  };
}
