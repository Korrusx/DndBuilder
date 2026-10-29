import { listEntries, saveCampaign, saveParticipant, saveSession } from '@/entities/campaign/api';
import { memoryDb } from '@/shared/db/__tests__/nodeSqlite';

import { recordEvent } from '../record';
import { saveJournalSettings } from '../settings';

const at = '2026-10-29T19:48:00.000Z';
const nat20 = { type: 'natural' as const, natural: 20 as const, roll: 'Ловкость рук' };

/** Кампания «Тени Солёной Гавани», Ирма прикреплена; при `session` — идёт сессия 12. */
async function shadows(options: { session?: boolean } = {}) {
  const db = await memoryDb();
  await saveJournalSettings(db, { disabled: [] });
  await saveCampaign(db, {
    id: 'shadows',
    name: 'Тени Солёной Гавани',
    gmName: 'Никита',
    createdAt: at,
    updatedAt: at,
  });
  await saveParticipant(db, {
    campaignId: 'shadows',
    characterId: 'irma',
    status: 'active',
    joinedAt: at,
    updatedAt: at,
  });
  if (options.session) {
    await saveSession(db, { id: 's12', campaignId: 'shadows', number: 12, startedAt: at, updatedAt: at });
  }
  return db;
}

describe('журнал событий', () => {
  test('натуральная 20 на Ловкость рук попадает в идущую сессию', async () => {
    const db = await shadows({ session: true });
    const entry = await recordEvent(db, nat20, { characterId: 'irma', at });
    expect(entry).toMatchObject({ sessionId: 's12', kind: 'event', eventType: 'natural', characterId: 'irma' });
    const [saved] = await listEntries(db, 'shadows');
    expect(saved.eventData).toEqual({ natural: 20, roll: 'Ловкость рук' });
  });

  test('без активной сессии — «между сессиями»', async () => {
    const db = await shadows();
    await saveSession(db, {
      id: 's11',
      campaignId: 'shadows',
      number: 11,
      startedAt: at,
      endedAt: at,
      updatedAt: at,
    });
    expect((await recordEvent(db, nat20, { characterId: 'irma', at }))?.sessionId).toBeNull();
  });

  test('без кампании, у павшего героя и при выключенной группе — ничего не пишется', async () => {
    const db = await shadows({ session: true });
    expect(await recordEvent(db, nat20, { characterId: 'stranger', at })).toBeNull();

    await saveParticipant(db, {
      campaignId: 'shadows',
      characterId: 'irma',
      status: 'fallen',
      joinedAt: at,
      updatedAt: at,
    });
    expect(await recordEvent(db, nat20, { characterId: 'irma', at })).toBeNull();

    await saveJournalSettings(db, { disabled: ['chronicle'] });
    const quest = { type: 'quest' as const, questId: 'q', name: 'Пропавшие рыбаки', change: 'new' as const };
    expect(await recordEvent(db, quest, { campaignId: 'shadows', at })).toBeNull();
    expect(await listEntries(db, 'shadows')).toEqual([]);
  });

  test('события хроники пишутся прямо в кампанию', async () => {
    const db = await shadows({ session: true });
    const person = { type: 'person' as const, entityId: 'boris', name: 'Борис' };
    expect((await recordEvent(db, person, { campaignId: 'shadows', at }))?.sessionId).toBe('s12');
  });
});
