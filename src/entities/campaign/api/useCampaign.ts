// Кампания целиком для экранов хроники. Перечитывается, когда экран снова становится видимым.

import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';

import type { CampaignData } from '../model/types';
import { getCampaign, listParticipants } from './campaigns';
import { listEntities } from './entities';
import { listEntries } from './entries';
import { listSessions } from './sessions';

export async function loadCampaign(
  db: Parameters<typeof getCampaign>[0],
  campaignId: string,
): Promise<CampaignData | null> {
  const campaign = await getCampaign(db, campaignId);
  if (!campaign) {
    return null;
  }
  const [participants, sessions, entries, entities] = await Promise.all([
    listParticipants(db, campaignId),
    listSessions(db, campaignId),
    listEntries(db, campaignId),
    listEntities(db, campaignId),
  ]);
  return { campaign, participants, sessions, entries, entities };
}

/** undefined — ещё грузится, null — кампании нет. */
export function useCampaign(campaignId: string) {
  const db = useSQLiteContext();
  const [data, setData] = useState<CampaignData | null | undefined>(undefined);

  const reload = useCallback(async () => {
    setData(await loadCampaign(db, campaignId));
  }, [db, campaignId]);

  useFocusEffect(
    useCallback(() => {
      reload().catch(() => setData(null));
    }, [reload]),
  );

  return { db, data, reload };
}
