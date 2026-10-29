// «Внести из кошелька»: монеты списываются у героя, счётчик квеста растёт, в летописи — «Выплачено 50 зм: …».

import type { SQLiteDatabase } from 'expo-sqlite';

import { contributeToCounter } from '@/entities/campaign';
import { recordEvent, saveQuestCounter } from '@/entities/campaign/api';
import { spendCoins, walletValue } from '@/entities/character';
import { getCharacter, notifyCharacterChanged, saveCharacter } from '@/entities/character/api';

import { walletCoin } from '../model/walletCoin';
import type { PayRequest, PayResult } from '../model/types';

export async function payFromWallet(db: SQLiteDatabase, request: PayRequest): Promise<PayResult> {
  const character = await getCharacter(db, request.characterId);
  if (!character) {
    return { ok: false, reason: 'noCharacter' };
  }
  const unit = walletCoin(request.counter.unit);
  const coins = spendCoins(character.coins, request.amount, unit);
  if (!coins) {
    return { ok: false, reason: 'notEnough', available: walletValue(character.coins, unit), unit };
  }
  const now = new Date().toISOString();
  await saveCharacter(db, { ...character, coins });
  notifyCharacterChanged(character.id);
  const counter = await saveQuestCounter(db, contributeToCounter(request.counter, request.amount, now));
  await recordEvent(
    db,
    { type: 'payment', questId: request.questId, name: request.questName, amount: request.amount, unit },
    { campaignId: request.campaignId, characterId: character.id, at: now },
  );
  return { ok: true, counter };
}
