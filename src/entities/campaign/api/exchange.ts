// Хроника кампании ↔ файл: собрать из базы со всеми фото и записать обратно (заменив кампанию с тем же id).

import type { SQLiteDatabase } from 'expo-sqlite';

import { buildChronicleFile, chroniclePhotoIds } from '../model/exchange';
import type { ChronicleFile } from '../model/types';
import { notifyCampaignChanged } from './changes';
import {
  campaignToRow,
  entityLinkToRow,
  entityToRow,
  entryToRow,
  participantToRow,
  questCounterToRow,
  questStepToRow,
  sessionToRow,
} from './serialize';
import { upsert } from './upsert';
import { loadCampaign } from './useCampaign';

export async function exportChronicle(db: SQLiteDatabase, campaignId: string): Promise<ChronicleFile | null> {
  const data = await loadCampaign(db, campaignId);
  if (!data) {
    return null;
  }
  const ids = chroniclePhotoIds(data);
  const rows = ids.length
    ? await db.getAllAsync<{ id: string; data: string }>(
        `SELECT id, data FROM photos WHERE id IN (${ids.map(() => '?').join(', ')})`,
        ids,
      )
    : [];
  return buildChronicleFile(data, Object.fromEntries(rows.map((row) => [row.id, row.data])), new Date().toISOString());
}

export async function campaignExists(db: SQLiteDatabase, campaignId: string): Promise<boolean> {
  return !!(await db.getFirstAsync<{ id: string }>('SELECT id FROM campaigns WHERE id = ?', campaignId));
}

/** Удаляет кампанию со всей хроникой (фото, на которые больше никто не ссылается, остаются — они небольшие). */
async function deleteCampaignRows(db: SQLiteDatabase, campaignId: string) {
  const ofEntities = 'IN (SELECT id FROM entities WHERE campaign_id = ?)';
  await db.runAsync(`DELETE FROM quest_steps WHERE quest_id ${ofEntities}`, campaignId);
  await db.runAsync(`DELETE FROM quest_counters WHERE quest_id ${ofEntities}`, campaignId);
  await db.runAsync(
    `DELETE FROM entity_links WHERE from_id ${ofEntities} OR to_id ${ofEntities}`,
    campaignId,
    campaignId,
  );
  for (const table of ['entities', 'entries', 'sessions', 'campaign_characters']) {
    await db.runAsync(`DELETE FROM ${table} WHERE campaign_id = ?`, campaignId);
  }
  await db.runAsync('DELETE FROM campaigns WHERE id = ?', campaignId);
}

/** Записывает хронику из файла. Кампания с тем же id заменяется целиком. */
export async function importChronicle(db: SQLiteDatabase, file: ChronicleFile): Promise<void> {
  await db.withTransactionAsync(async () => {
    await deleteCampaignRows(db, file.campaign.id);
    await upsert(db, 'campaigns', campaignToRow(file.campaign), ['id']);
    for (const participant of file.participants) {
      await upsert(db, 'campaign_characters', participantToRow(participant), ['campaign_id', 'character_id']);
    }
    for (const session of file.sessions) {
      await upsert(db, 'sessions', sessionToRow(session), ['id']);
    }
    for (const entry of file.entries) {
      await upsert(db, 'entries', entryToRow(entry), ['id']);
    }
    for (const entity of file.entities) {
      await upsert(db, 'entities', entityToRow(entity), ['id']);
    }
    for (const step of file.steps) {
      await upsert(db, 'quest_steps', questStepToRow(step), ['id']);
    }
    for (const counter of file.counters) {
      await upsert(db, 'quest_counters', questCounterToRow(counter), ['quest_id']);
    }
    for (const link of file.links) {
      await upsert(db, 'entity_links', entityLinkToRow(link), ['id']);
    }
    for (const [id, data] of Object.entries(file.photos)) {
      await upsert(db, 'photos', { id, data, created_at: file.exportedAt || new Date().toISOString() }, ['id']);
    }
  });
  notifyCampaignChanged(file.campaign.id);
}
