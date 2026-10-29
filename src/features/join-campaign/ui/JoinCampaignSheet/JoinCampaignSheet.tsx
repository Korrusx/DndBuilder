import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { Pressable, TextInput } from 'react-native';

import type { Campaign } from '@/entities/campaign';
import { listCampaigns } from '@/entities/campaign/api';
import { usePlay } from '@/entities/character/ui';
import { colors } from '@/shared/config';
import { useTranslation } from '@/shared/i18n';
import { AppText, BottomSheet, Button } from '@/shared/ui';

import { attachCharacter, createCampaign } from '../../api/join';
import { styles } from './JoinCampaignSheet.styles';
import type { JoinCampaignSheetProps } from './JoinCampaignSheet.types';

/** «Начать хронику»: выбрать кампанию, где уже играют другие герои, или создать новую. */
export function JoinCampaignSheet({ visible, onClose, onJoined }: JoinCampaignSheetProps) {
  const db = useSQLiteContext();
  const { t } = useTranslation();
  const { character, update } = usePlay();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [name, setName] = useState(character.campaign ?? '');
  const [gmName, setGmName] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (visible) {
      listCampaigns(db)
        .then(setCampaigns)
        .catch(() => setCampaigns([]));
    }
  }, [db, visible]);

  const join = async (pick: () => Promise<Campaign>) => {
    setBusy(true);
    try {
      const campaign = await pick();
      await attachCharacter(db, campaign.id, character.id);
      // Старое поле видно на карточке персонажа — пусть совпадает с кампанией.
      update((d) => ({ ...d, campaign: campaign.name }), { journal: false });
      onJoined(campaign);
    } finally {
      setBusy(false);
    }
  };

  return (
    <BottomSheet visible={visible} title={t('chronicle.join.title')} onClose={onClose}>
      {campaigns.length ? <AppText variant="secondary">{t('chronicle.join.existing')}</AppText> : null}
      {campaigns.map((campaign) => (
        <Pressable
          key={campaign.id}
          accessibilityRole="button"
          disabled={busy}
          onPress={() => join(async () => campaign)}
          style={styles.row}
        >
          <AppText style={styles.rowName}>{campaign.name}</AppText>
          {campaign.gmName ? (
            <AppText variant="secondary">{t('chronicle.gm', { name: campaign.gmName })}</AppText>
          ) : null}
        </Pressable>
      ))}
      <AppText variant="secondary">{t('chronicle.join.new')}</AppText>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder={t('chronicle.join.namePlaceholder')}
        placeholderTextColor={colors.textSecondary}
        style={styles.input}
      />
      <TextInput
        value={gmName}
        onChangeText={setGmName}
        placeholder={t('chronicle.join.gmPlaceholder')}
        placeholderTextColor={colors.textSecondary}
        style={styles.input}
      />
      <Button
        title={t('chronicle.join.create')}
        disabled={busy || !name.trim()}
        onPress={() => join(() => createCampaign(db, name, gmName, character.edition))}
      />
    </BottomSheet>
  );
}
