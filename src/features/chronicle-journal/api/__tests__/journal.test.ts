import { listEntries, saveCampaign, saveJournalSettings, saveParticipant } from '@/entities/campaign/api';
import { memoryDb } from '@/shared/db/__tests__/nodeSqlite';
import { emitPlayEvent } from '@/shared/lib/play-events';

import { COIN_QUIET_MS } from '../../config/constants';
import { startJournal } from '../journal';

const at = '2026-10-29T19:00:00.000Z';

async function irmaInShadows() {
  const db = await memoryDb();
  await saveJournalSettings(db, { disabled: [] });
  await saveCampaign(db, { id: 'shadows', name: 'Тени Солёной Гавани', createdAt: at, updatedAt: at });
  await saveParticipant(db, {
    campaignId: 'shadows',
    characterId: 'irma',
    status: 'active',
    joinedAt: at,
    updatedAt: at,
  });
  return db;
}

describe('журнал от события до базы', () => {
  afterEach(() => jest.useRealTimers());

  test('натуральная 20 из окна броска (без id персонажа) и 0 хитов от провайдера', async () => {
    const db = await irmaInShadows();
    const journal = startJournal(db, 'irma');
    emitPlayEvent({ type: 'natural', natural: 20, roll: 'Ловкость рук' });
    emitPlayEvent({ type: 'down' }, 'irma');
    emitPlayEvent({ type: 'down' }, 'stranger');
    await journal.idle();
    journal.stop();
    expect((await listEntries(db, 'shadows')).map((entry) => entry.eventType)).toEqual(['natural', 'down']);
  });

  test('монеты копятся и пишутся одной записью после паузы', async () => {
    jest.useFakeTimers();
    const db = await irmaInShadows();
    const journal = startJournal(db, 'irma');
    emitPlayEvent({ type: 'loot', direction: 'gain', items: [], coins: { gp: 4 } }, 'irma');
    emitPlayEvent({ type: 'loot', direction: 'gain', items: [], coins: { gp: 41 } }, 'irma');
    expect(await listEntries(db, 'shadows')).toEqual([]);
    jest.advanceTimersByTime(COIN_QUIET_MS);
    jest.useRealTimers();
    await journal.idle();
    journal.stop();
    const [entry] = await listEntries(db, 'shadows');
    expect(entry.eventData).toEqual({ direction: 'gain', items: [], coins: { gp: 45 } });
  });
});
