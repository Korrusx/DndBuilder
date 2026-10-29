// Перенос старого поля «название кампании» персонажей в таблицы хроники. Выполняется один раз после миграции 5.

import type { SQLiteDatabase } from 'expo-sqlite';

import type { Edition } from '@/shared/content';
import { getMeta, setMeta } from '@/shared/db';
import { newId } from '@/shared/lib/id';

import { planLegacyLinks } from '../model/legacy';
import type { LegacyCharacter } from '../model/types';
import { campaignToRow, participantToRow, rowToCampaign } from './serialize';
import type { CampaignRow, LegacyCharacterRow } from './types';
import { upsert } from './upsert';

function toLegacy(row: LegacyCharacterRow): LegacyCharacter {
  try {
    const data = JSON.parse(row.data) as { campaign?: unknown; edition?: unknown };
    return {
      id: row.id,
      campaign: typeof data.campaign === 'string' ? data.campaign : undefined,
      edition: data.edition === '2014' || data.edition === '2024' ? (data.edition as Edition) : undefined,
      createdAt: row.created_at,
    };
  } catch {
    return { id: row.id, createdAt: row.created_at };
  }
}

/** Создаёт кампании по названиям из персонажей и прикрепляет персонажей. Старое поле не трогает. */
export async function linkLegacyCampaigns(db: SQLiteDatabase, now = new Date().toISOString()): Promise<void> {
  if (await getMeta(db, 'legacyCampaignsLinked')) {
    return;
  }
  const characters = await db.getAllAsync<LegacyCharacterRow>(
    'SELECT id, data, created_at FROM characters ORDER BY created_at',
  );
  const campaigns = await db.getAllAsync<CampaignRow>('SELECT * FROM campaigns');
  const linked = await db.getAllAsync<{ character_id: string }>('SELECT character_id FROM campaign_characters');
  const plan = planLegacyLinks(
    characters.map(toLegacy),
    campaigns.map(rowToCampaign),
    new Set(linked.map((row) => row.character_id)),
    now,
    newId,
  );
  await db.withTransactionAsync(async () => {
    for (const campaign of plan.campaigns) {
      await upsert(db, 'campaigns', campaignToRow(campaign), ['id']);
    }
    for (const link of plan.links) {
      await upsert(db, 'campaign_characters', participantToRow(link), ['campaign_id', 'character_id']);
    }
    await setMeta(db, 'legacyCampaignsLinked', now);
  });
}
