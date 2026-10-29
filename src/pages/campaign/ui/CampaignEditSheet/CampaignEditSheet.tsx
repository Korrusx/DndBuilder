import { TextInput } from 'react-native';

import { colors } from '@/shared/config';
import { useTranslation } from '@/shared/i18n';
import { useResetState } from '@/shared/lib/reset-state';
import { AppText, BottomSheet, Button } from '@/shared/ui';

import { styles } from './CampaignEditSheet.styles';
import type { CampaignEditSheetProps } from './CampaignEditSheet.types';

/** Название кампании и имя мастера. */
export function CampaignEditSheet({ campaign, visible, onClose, onSave }: CampaignEditSheetProps) {
  const { t } = useTranslation();
  const [name, setName] = useResetState(campaign.name, visible);
  const [gmName, setGmName] = useResetState(campaign.gmName ?? '', visible);
  return (
    <BottomSheet visible={visible} title={t('chronicle.edit.title')} onClose={onClose}>
      <AppText variant="secondary">{t('chronicle.edit.name')}</AppText>
      <TextInput value={name} onChangeText={setName} placeholderTextColor={colors.textSecondary} style={styles.input} />
      <AppText variant="secondary">{t('chronicle.edit.gm')}</AppText>
      <TextInput
        value={gmName}
        onChangeText={setGmName}
        placeholder={t('chronicle.join.gmPlaceholder')}
        placeholderTextColor={colors.textSecondary}
        style={styles.input}
      />
      <Button title={t('common.done')} disabled={!name.trim()} onPress={() => onSave(name, gmName)} />
    </BottomSheet>
  );
}
