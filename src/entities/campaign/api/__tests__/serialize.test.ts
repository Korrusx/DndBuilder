import { memoryDb } from '@/shared/db/__tests__/nodeSqlite';

import type { Entity, EntityLink, Entry, QuestCounter, QuestStep, Session } from '../../model/types';
import {
  entityLinkToRow,
  entityToRow,
  entryToRow,
  questCounterToRow,
  questStepToRow,
  rowToEntity,
  rowToEntityLink,
  rowToEntry,
  rowToQuestCounter,
  rowToQuestStep,
  rowToSession,
  sessionToRow,
} from '../serialize';
import { upsert } from '../upsert';

const at = '2026-10-29T12:00:00.000Z';

describe('таблицы хроники: запись и чтение без потерь', () => {
  test('сессия, запись, карточка, шаг, счётчик, связь', async () => {
    const db = await memoryDb();
    const session: Session = { id: 's11', campaignId: 'c', number: 11, startedAt: at, updatedAt: at };
    const entry: Entry = {
      id: 'e1',
      campaignId: 'c',
      sessionId: null,
      kind: 'event',
      createdAt: at,
      text: '',
      tags: ['loot'],
      secret: true,
      eventType: 'coins',
      eventData: { gp: 45 },
      characterId: 'irma',
      photoIds: [],
      updatedAt: at,
    };
    const quest: Entity = {
      id: 'q',
      campaignId: 'c',
      type: 'quest',
      name: 'Долг «Тихим рукам»',
      role: 'с предыстории',
      description: 'Следующий взнос — до праздника Прилива',
      status: 'active',
      attitude: 0,
      personal: true,
      givenById: 'boris',
      reward: '',
      createdAt: at,
      updatedAt: at,
    };
    const step: QuestStep = { id: 'st', questId: 'q', text: 'Найти ключ', done: true, order: 2, updatedAt: at };
    const counter: QuestCounter = {
      questId: 'q',
      current: 180,
      target: 500,
      unit: 'gp',
      linkedToWallet: true,
      updatedAt: at,
    };
    const link: EntityLink = { id: 'l', fromId: 'boris', toId: 'q', label: 'хранит груз', updatedAt: at };

    await upsert(db, 'sessions', sessionToRow(session), ['id']);
    await upsert(db, 'entries', entryToRow(entry), ['id']);
    await upsert(db, 'entities', entityToRow(quest), ['id']);
    await upsert(db, 'quest_steps', questStepToRow(step), ['id']);
    await upsert(db, 'quest_counters', questCounterToRow(counter), ['quest_id']);
    await upsert(db, 'entity_links', entityLinkToRow(link), ['id']);

    expect(rowToSession((await db.getFirstAsync('SELECT * FROM sessions'))!)).toEqual(session);
    expect(rowToEntry((await db.getFirstAsync('SELECT * FROM entries'))!)).toEqual(entry);
    expect(rowToEntity((await db.getFirstAsync('SELECT * FROM entities'))!)).toEqual(quest);
    expect(rowToQuestStep((await db.getFirstAsync('SELECT * FROM quest_steps'))!)).toEqual(step);
    expect(rowToQuestCounter((await db.getFirstAsync('SELECT * FROM quest_counters'))!)).toEqual(counter);
    expect(rowToEntityLink((await db.getFirstAsync('SELECT * FROM entity_links'))!)).toEqual(link);
  });
});
