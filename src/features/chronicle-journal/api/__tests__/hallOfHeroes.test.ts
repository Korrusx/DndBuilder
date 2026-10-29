// «Тени Солёной Гавани», мастер Никита: Ирма (плут 5) пала, новый герой продолжает ту же летопись.

import { hallOfHeroes, nextSessionNumber } from '@/entities/campaign';
import {
  listEntries,
  listParticipants,
  listSessions,
  participationOf,
  saveCampaign,
  saveJournalSettings,
  saveParticipant,
  saveSession,
} from '@/entities/campaign/api';
import { memoryDb } from '@/shared/db/__tests__/nodeSqlite';
import { emitPlayEvent } from '@/shared/lib/play-events';

import { startJournal } from '../journal';

const at = (day: number) => `2026-10-${String(day).padStart(2, '0')}T19:00:00.000Z`;

test('Зал героев: Ирма пала с эпитафией, новый герой продолжает нумерацию сессий', async () => {
  const db = await memoryDb();
  await saveJournalSettings(db, { disabled: [] });
  await saveCampaign(db, {
    id: 'shadows',
    name: 'Тени Солёной Гавани',
    gmName: 'Никита',
    createdAt: at(1),
    updatedAt: at(1),
  });
  await saveParticipant(db, {
    campaignId: 'shadows',
    characterId: 'irma',
    status: 'active',
    joinedAt: at(1),
    updatedAt: at(1),
  });
  for (const number of [10, 11]) {
    await saveSession(db, {
      id: `s${number}`,
      campaignId: 'shadows',
      number,
      startedAt: at(number),
      endedAt: at(number),
      updatedAt: at(number),
    });
  }

  // Ирма пала.
  const irma = (await participationOf(db, 'irma'))!;
  await saveParticipant(db, { ...irma, status: 'fallen', epitaph: 'Ушла в тень с чужим ключом', leftAt: at(22) });
  const hall = hallOfHeroes(await listParticipants(db, 'shadows'));
  expect(hall.map((hero) => [hero.characterId, hero.epitaph])).toEqual([['irma', 'Ушла в тень с чужим ключом']]);

  // Новый герой в той же кампании, следующая сессия — 12.
  await saveParticipant(db, {
    campaignId: 'shadows',
    characterId: 'tom',
    status: 'active',
    joinedAt: at(28),
    updatedAt: at(28),
  });
  const sessions = await listSessions(db, 'shadows');
  expect(nextSessionNumber(sessions)).toBe(12);
  await saveSession(db, { id: 's12', campaignId: 'shadows', number: 12, startedAt: at(29), updatedAt: at(29) });

  // События нового героя идут в сессию 12, павшей Ирмы — никуда.
  const tom = startJournal(db, 'tom');
  const irmaJournal = startJournal(db, 'irma');
  emitPlayEvent({ type: 'natural', natural: 20, roll: 'Атлетика' }, 'tom');
  emitPlayEvent({ type: 'natural', natural: 1, roll: 'Скрытность' }, 'irma');
  await tom.idle();
  await irmaJournal.idle();
  tom.stop();
  irmaJournal.stop();
  const entries = await listEntries(db, 'shadows');
  expect(entries.map((entry) => [entry.characterId, entry.sessionId])).toEqual([['tom', 's12']]);
  expect(hallOfHeroes(await listParticipants(db, 'shadows'))).toHaveLength(1);
});
