// Прикрепить персонажа к кампании: к выбранной или к новой (если кампания с таким названием уже есть — к ней).

import type { SQLiteDatabase } from 'expo-sqlite';

import type { Campaign } from '@/entities/campaign';
import { campaignNameKey } from '@/entities/campaign';
import { listCampaigns, saveCampaign, saveParticipant } from '@/entities/campaign/api';
import type { Edition } from '@/shared/content';
import { newId } from '@/shared/lib/id';

export async function createCampaign(
  db: SQLiteDatabase,
  name: string,
  gmName: string,
  edition: Edition,
): Promise<Campaign> {
  const trimmed = name.trim().replace(/\s+/g, ' ');
  const existing = (await listCampaigns(db)).find(
    (campaign) => campaignNameKey(campaign.name) === campaignNameKey(trimmed),
  );
  if (existing) {
    return existing;
  }
  const now = new Date().toISOString();
  return saveCampaign(db, {
    id: newId(),
    name: trimmed,
    gmName: gmName.trim() || undefined,
    edition,
    createdAt: now,
    updatedAt: now,
  });
}

export async function attachCharacter(db: SQLiteDatabase, campaignId: string, characterId: string): Promise<void> {
  const now = new Date().toISOString();
  await saveParticipant(db, { campaignId, characterId, status: 'active', joinedAt: now, updatedAt: now });
}
