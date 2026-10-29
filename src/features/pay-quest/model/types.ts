import type { QuestCounter } from '@/entities/campaign';
import type { Coin } from '@/shared/content';

export type PayRequest = {
  campaignId: string;
  questId: string;
  questName: string;
  counter: QuestCounter;
  characterId: string;
  amount: number;
};

export type PayResult =
  | { ok: true; counter: QuestCounter }
  /** В кошельке меньше, чем вносят: `available` — сколько есть в монетах счётчика. */
  | { ok: false; reason: 'notEnough'; available: number; unit: Coin }
  | { ok: false; reason: 'noCharacter' };
