import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Pressable } from 'react-native';

import type { Campaign } from '@/entities/campaign';
import { getCampaign, participationOf } from '@/entities/campaign/api';
import { usePlay } from '@/entities/character/ui';
import { colors } from '@/shared/config';
import { useTranslation } from '@/shared/i18n';
import { AppText } from '@/shared/ui';

import { JoinCampaignSheet } from '../JoinCampaignSheet/JoinCampaignSheet';
import { styles } from './CampaignLink.styles';

const openCampaign = (campaign: Campaign) => router.push({ pathname: '/campaign/[id]', params: { id: campaign.id } });

/** Название кампании персонажа — кнопка в хронику; если кампании нет — «Начать хронику». */
export function CampaignLink() {
  const db = useSQLiteContext();
  const { t } = useTranslation();
  const { character } = usePlay();
  const [campaign, setCampaign] = useState<Campaign | null | undefined>(undefined);
  const [joining, setJoining] = useState(false);

  useFocusEffect(
    useCallback(() => {
      participationOf(db, character.id)
        .then((participation) => (participation ? getCampaign(db, participation.campaignId) : null))
        .then(setCampaign)
        .catch(() => setCampaign(null));
    }, [db, character.id]),
  );

  if (campaign === undefined) {
    return null;
  }

  return (
    <>
      <Pressable
        accessibilityRole="button"
        onPress={() => (campaign ? openCampaign(campaign) : setJoining(true))}
        style={[styles.link, !campaign && styles.start]}
      >
        <MaterialCommunityIcons
          name="book-open-page-variant-outline"
          size={20}
          color={campaign ? colors.accent : colors.textSecondary}
        />
        <AppText style={[styles.name, !campaign && styles.startText]} numberOfLines={1}>
          {campaign ? campaign.name : t('chronicle.join.start')}
        </AppText>
        <AppText style={styles.chevron}>›</AppText>
      </Pressable>
      <JoinCampaignSheet
        visible={joining}
        onClose={() => setJoining(false)}
        onJoined={(joined) => {
          setJoining(false);
          setCampaign(joined);
          openCampaign(joined);
        }}
      />
    </>
  );
}
