import type { QuestCounter } from '@/entities/campaign';
import { eventText } from '@/entities/campaign';
import { listEntries, listQuestCounters, saveCampaign, saveEntity, saveParticipant } from '@/entities/campaign/api';
import { irmaLevel5 } from '@/entities/character';
import { getCharacter, saveCharacter } from '@/entities/character/api';
import { memoryDb } from '@/shared/db/__tests__/nodeSqlite';

import { payFromWallet } from '../pay';

const at = '2026-10-29T19:00:00.000Z';
const debt: QuestCounter = {
  questId: 'debt',
  current: 180,
  target: 500,
  unit: 'gp',
  linkedToWallet: true,
  updatedAt: at,
};

async function irmaOwes() {
  const db = await memoryDb();
  await saveCampaign(db, { id: 'shadows', name: 'Тени Солёной Гавани', createdAt: at, updatedAt: at });
  await saveEntity(db, {
    id: 'debt',
    campaignId: 'shadows',
    type: 'quest',
    name: 'Долг «Тихим рукам»',
    role: 'с предыстории',
    description: '',
    status: 'active',
    attitude: 0,
    personal: true,
    createdAt: at,
    updatedAt: at,
  });
  await saveCharacter(db, { ...irmaLevel5(), id: 'irma', coins: { gp: 60 } });
  await saveParticipant(db, {
    campaignId: 'shadows',
    characterId: 'irma',
    status: 'active',
    joinedAt: at,
    updatedAt: at,
  });
  return db;
}

const request = (amount: number, counter = debt) => ({
  campaignId: 'shadows',
  questId: 'debt',
  questName: 'Долг «Тихим рукам»',
  counter,
  characterId: 'irma',
  amount,
});

describe('«Внести из кошелька»', () => {
  test('180 из 500 зм, в кошельке 60: внести 50 → 230 из 500, в кошельке 10, событие в летописи', async () => {
    const db = await irmaOwes();
    const result = await payFromWallet(db, request(50));
    expect(result.ok && result.counter.current).toBe(230);
    expect((await getCharacter(db, 'irma'))?.coins).toEqual({ gp: 10 });
    expect((await listQuestCounters(db, 'shadows'))[0].current).toBe(230);
    const [entry] = await listEntries(db, 'shadows');
    expect(eventText({ type: 'payment', ...(entry.eventData as object) } as never)).toBe(
      'Выплачено 50 зм: Долг «Тихим рукам»',
    );
  });

  test('внести 30 при 10 в кошельке — мягкий отказ, ничего не меняется', async () => {
    const db = await irmaOwes();
    const paid = await payFromWallet(db, request(50));
    const counter = paid.ok ? paid.counter : debt;
    expect(await payFromWallet(db, request(30, counter))).toEqual({
      ok: false,
      reason: 'notEnough',
      available: 10,
      unit: 'gp',
    });
    expect((await getCharacter(db, 'irma'))?.coins).toEqual({ gp: 10 });
    expect((await listQuestCounters(db, 'shadows'))[0].current).toBe(230);
    expect(await listEntries(db, 'shadows')).toHaveLength(1);
  });
});
