// Кампании и прикреплённые к ним персонажи в пользовательской базе.

import type { SQLiteDatabase } from 'expo-sqlite';

import type { Campaign, CampaignCharacter } from '../model/types';
import { campaignToRow, participantToRow, rowToCampaign, rowToParticipant } from './serialize';
import type { CampaignCharacterRow, CampaignRow } from './types';
import { upsert } from './upsert';

/** Все кампании, сначала недавно изменённые. */
export async function listCampaigns(db: SQLiteDatabase): Promise<Campaign[]> {
  const rows = await db.getAllAsync<CampaignRow>('SELECT * FROM campaigns ORDER BY updated_at DESC');
  return rows.map(rowToCampaign);
}

export async function getCampaign(db: SQLiteDatabase, id: string): Promise<Campaign | null> {
  const row = await db.getFirstAsync<CampaignRow>('SELECT * FROM campaigns WHERE id = ?', id);
  return row ? rowToCampaign(row) : null;
}

/** Создаёт или обновляет кампанию. Время изменения ставится автоматически. */
export async function saveCampaign(db: SQLiteDatabase, campaign: Campaign): Promise<Campaign> {
  const saved = { ...campaign, updatedAt: new Date().toISOString() };
  await upsert(db, 'campaigns', campaignToRow(saved), ['id']);
  return saved;
}

/** Персонажи кампании в порядке прихода (действующие и «Зал героев»). */
export async function listParticipants(db: SQLiteDatabase, campaignId: string): Promise<CampaignCharacter[]> {
  const rows = await db.getAllAsync<CampaignCharacterRow>(
    'SELECT * FROM campaign_characters WHERE campaign_id = ? ORDER BY joined_at',
    campaignId,
  );
  return rows.map(rowToParticipant);
}

/** Кампания, в которой персонаж участвует (последняя по времени прихода), или null. */
export async function participationOf(db: SQLiteDatabase, characterId: string): Promise<CampaignCharacter | null> {
  const row = await db.getFirstAsync<CampaignCharacterRow>(
    'SELECT * FROM campaign_characters WHERE character_id = ? ORDER BY joined_at DESC',
    characterId,
  );
  return row ? rowToParticipant(row) : null;
}

/** Прикрепляет персонажа к кампании или меняет его статус. */
export async function saveParticipant(db: SQLiteDatabase, participant: CampaignCharacter): Promise<CampaignCharacter> {
  const saved = { ...participant, updatedAt: new Date().toISOString() };
  await upsert(db, 'campaign_characters', participantToRow(saved), ['campaign_id', 'character_id']);
  return saved;
}
