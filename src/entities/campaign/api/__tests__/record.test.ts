import { memoryDb } from '@/shared/db/__tests__/nodeSqlite';

import { saveCampaign, saveParticipant } from '../campaigns';
import { listEntries } from '../entries';
import { saveJournalSettings } from '../journalSettings';
import { deleteLevelEvent, journalState, recordEvent } from '../record';
import { saveSession } from '../sessions';

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

describe('куда идут события героя', () => {
  test('нет кампании → сессия → между сессиями → «Зал героев»', async () => {
    const db = await shadows({ session: true });
    expect(await journalState(db, 'stranger')).toEqual({ kind: 'none' });
    expect(await journalState(db, 'irma')).toEqual({ kind: 'session', campaignId: 'shadows', number: 12 });
    await saveSession(db, { id: 's12', campaignId: 'shadows', number: 12, startedAt: at, endedAt: at, updatedAt: at });
    expect(await journalState(db, 'irma')).toEqual({ kind: 'between', campaignId: 'shadows' });
    await saveParticipant(db, {
      campaignId: 'shadows',
      characterId: 'irma',
      status: 'fallen',
      joinedAt: at,
      updatedAt: at,
    });
    expect(await journalState(db, 'irma')).toEqual({ kind: 'hall', campaignId: 'shadows' });
  });

  test('отмена повышения удаляет последнюю запись о новом уровне; без кампании — ничего', async () => {
    const db = await shadows({ session: true });
    await recordEvent(db, { type: 'level', level: 5, classId: 'rogue', classLevel: 5 }, { characterId: 'irma', at });
    await recordEvent(db, { type: 'level', level: 6, classId: 'rogue', classLevel: 6 }, { characterId: 'irma', at });
    expect(await deleteLevelEvent(db, 'irma', 6)).toBe(true);
    const left = await listEntries(db, 'shadows');
    expect(left.map((e) => e.eventData?.level)).toEqual([5]);
    expect(await deleteLevelEvent(db, 'irma', 6)).toBe(false);
    expect(await deleteLevelEvent(db, 'stranger', 5)).toBe(false);
  });
});
