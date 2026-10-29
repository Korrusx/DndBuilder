// Шаги и счётчики квестов, связи карточек в пользовательской базе.

import type { SQLiteDatabase } from 'expo-sqlite';

import type { EntityLink, QuestCounter, QuestStep } from '../model/types';
import {
  entityLinkToRow,
  questCounterToRow,
  questStepToRow,
  rowToEntityLink,
  rowToQuestCounter,
  rowToQuestStep,
} from './serialize';
import type { EntityLinkRow, QuestCounterRow, QuestStepRow } from './types';
import { upsert } from './upsert';

const ofCampaign = 'IN (SELECT id FROM entities WHERE campaign_id = ?)';

export async function listQuestSteps(db: SQLiteDatabase, campaignId: string): Promise<QuestStep[]> {
  const rows = await db.getAllAsync<QuestStepRow>(
    `SELECT * FROM quest_steps WHERE quest_id ${ofCampaign} ORDER BY sort_order`,
    campaignId,
  );
  return rows.map(rowToQuestStep);
}

export async function saveQuestStep(db: SQLiteDatabase, step: QuestStep): Promise<QuestStep> {
  const saved = { ...step, updatedAt: new Date().toISOString() };
  await upsert(db, 'quest_steps', questStepToRow(saved), ['id']);
  return saved;
}

export async function deleteQuestStep(db: SQLiteDatabase, id: string): Promise<void> {
  await db.runAsync('DELETE FROM quest_steps WHERE id = ?', id);
}

export async function listQuestCounters(db: SQLiteDatabase, campaignId: string): Promise<QuestCounter[]> {
  const rows = await db.getAllAsync<QuestCounterRow>(
    `SELECT * FROM quest_counters WHERE quest_id ${ofCampaign}`,
    campaignId,
  );
  return rows.map(rowToQuestCounter);
}

export async function saveQuestCounter(db: SQLiteDatabase, counter: QuestCounter): Promise<QuestCounter> {
  const saved = { ...counter, updatedAt: new Date().toISOString() };
  await upsert(db, 'quest_counters', questCounterToRow(saved), ['quest_id']);
  return saved;
}

export async function deleteQuestCounter(db: SQLiteDatabase, questId: string): Promise<void> {
  await db.runAsync('DELETE FROM quest_counters WHERE quest_id = ?', questId);
}

/** Связи, где хотя бы одна сторона — карточка этой кампании. */
export async function listEntityLinks(db: SQLiteDatabase, campaignId: string): Promise<EntityLink[]> {
  const rows = await db.getAllAsync<EntityLinkRow>(
    `SELECT * FROM entity_links WHERE from_id ${ofCampaign} OR to_id ${ofCampaign}`,
    campaignId,
    campaignId,
  );
  return rows.map(rowToEntityLink);
}

export async function saveEntityLink(db: SQLiteDatabase, link: EntityLink): Promise<EntityLink> {
  const saved = { ...link, updatedAt: new Date().toISOString() };
  await upsert(db, 'entity_links', entityLinkToRow(saved), ['id']);
  return saved;
}

export async function deleteEntityLink(db: SQLiteDatabase, id: string): Promise<void> {
  await db.runAsync('DELETE FROM entity_links WHERE id = ?', id);
}
