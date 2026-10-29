// Журнал хроники: слушает события режима игры открытого персонажа и пишет их в летопись его кампании.
// Ничего не показывает; подключается один раз рядом с CharacterProvider.

import { useSQLiteContext } from 'expo-sqlite';
import { useEffect } from 'react';

import type { ChronicleEvent } from '@/entities/campaign';
import { usePlay } from '@/entities/character/ui';
import { onPlayEvent } from '@/shared/lib/play-events';

import { recordEvent } from '../../api/record';
import { COIN_QUIET_MS } from '../../config/constants';
import { addToBalance, balanceEvents, isCoinsOnly } from '../../model/coins';
import type { CoinBalance } from '../../model/types';

export function ChronicleJournal() {
  const db = useSQLiteContext();
  const { character } = usePlay();
  const characterId = character.id;

  useEffect(() => {
    let balance: CoinBalance = {};
    let timer: ReturnType<typeof setTimeout> | null = null;
    // Записи идут по очереди, чтобы порядок в летописи совпадал с порядком событий.
    let queue: Promise<unknown> = Promise.resolve();
    const write = (event: ChronicleEvent) => {
      queue = queue.then(() => recordEvent(db, event, { characterId })).catch(() => undefined);
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
    return () => {
      off();
      flushCoins();
    };
  }, [db, characterId]);

  return null;
}
